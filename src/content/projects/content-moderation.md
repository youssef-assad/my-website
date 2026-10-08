# Content Moderation Pipeline

## One-line summary

An event-driven pipeline that moderates every post — text, images, audio and video — by fanning each one out over Kafka to specialised ML services and folding their answers into a single recommendation. Built by our team as an internal system at Primesay.

## The problem

A social platform can't rely on humans to look at every post, and it can't rely on one model to understand every kind of content. A caption, a photo, a voice note and a video fail in completely different ways. Text needs a safety-tuned language model, images need visual classifiers, audio needs both speech recognition and sound-event detection, and video is mostly an image problem with a time dimension.

The requirements we set were:
- A post must never be shown as "safe" because something *failed to look at it*.
- A slow or broken ML service must not stall everyone else's posts.
- The system recommends; the platform's existing human workflow decides.
- The moderation side keeps no state of its own, so it can be killed and restarted at any time.

## Who it's for

Internal platform teams and moderators. This is not a public product and has no public demo. The portfolio entry exists because it shows a full event-driven system built from several independent services: Kafka consumers, retry and dead-letter handling, ML serving, and decision logic that has to fail safe.

## What it does

- Consumes a "post created" event from Kafka and moderates every part of the post in parallel.
- **Text:** a Llama Guard 3 1B safety verdict on the caption, plus separate classification (open themes via Qwen 2.5 1.5B and a broad category via MiniLM).
- **Images:** four classifiers run on every upload (NSFW, violence, gore, nudity). The worst opinion wins, and thresholds live in a config file that operations can tune without a deploy.
- **Audio:** speech is transcribed with faster-whisper and the transcript is judged by the text service. Separately, a PANNs CNN14 sound-event model listens for non-speech events such as screams and gunshots. The two results are combined, worst outcome wins.
- **Video:** keyframes are extracted with ffmpeg, near-duplicates are dropped, each kept frame goes through the image service, and the frame results are fused into one video verdict.
- Enriches clean posts with a category, themes, image captions and OCR, and four embedding vectors (text, image, audio, transcript) for a similarity-based feed.
- Sends one verdict (`safe`, `flagged` or `blocked`) back with the per-model evidence attached.

## Architecture overview

The backend produces a `post.created` event to a Kafka topic. A worker consumes it, downloads the media, calls the ML services, and publishes the outcome to `post.processed`. A separate publisher process consumes that and delivers the verdict over HTTP. Failures go to `post.failed`, a retry process re-queues them with backoff, and posts that run out of attempts land on `post.dead` for a human.

```
post.created ──► worker ──► ML services (text · image · audio · video)
                   │
                   ├─ ok ───► post.processed ──► publisher ──► backend
                   └─ fail ─► post.failed ──► retry ──► post.created (again)
                                                  └─ out of attempts ─► post.dead
```

The orchestrator is **stateless**: no database, no cache, no disk that outlives a post. Kafka is a buffer, not a store. All durable results live on the backend side, written from the data we hand back. The ML services are independent and don't know about each other; one exception is that the audio service calls the text service to judge its transcript.

Moderation and delivery are separate processes on purpose. If the backend is down, moderation keeps running and verdicts queue up on `post.processed` until it returns.

## Stack and why

- **Kafka** — absorbs traffic spikes, decouples the platform from the ML services' speed, and gives us redelivery for free. A burst of posts becomes lag on a topic instead of a pile of timeouts on a user's request.

- **Python + FastAPI for every ML service** — one language across the services, typed request/response models, auto-generated OpenAPI docs that double as the contract between services.

- **A separate service per modality** — text, image, audio and video each scale and fail differently. Text needs two GPU-backed model servers; the image classifiers are small and run fine on CPU; the orchestrator has no models at all. Splitting them lets each get the hardware it needs and be redeployed on its own.

- **llama.cpp for the text models** — runs quantized GGUF models with all layers on the GPU, which keeps two safety models small enough to serve side by side.

- **faster-whisper for transcription** — much faster than reference Whisper, and it runs acceptably on CPU as a default with GPU as the upgrade path.

- **ffmpeg for video** — shot-change detection and keyframe extraction. Treated as hostile-input handling, because untrusted video goes into it.

- **No orchestration framework** — plain consumers, plain HTTP calls. The control flow is short enough to read in one file, and the failure behaviour has to be exact.

## Key technical decisions

**1. Worst signal wins.** A post has many checks. Any `blocked` check blocks the post; otherwise any `flagged` check flags it; otherwise anything unresolved leaves it pending; only then is it safe. Averaging would let a clean caption launder a harmful image. This rule is also easy to explain: we can always point to the single check that caused a decision.

**2. Fail toward a human, never toward "safe".** The rule we hold hardest. Examples:
- A service returns a decision string we don't recognise: raise, never treat it as safe.
- Audio with no speech: the service would say "allowed" because there was nothing to judge. The pipeline checks whether anything assessed the audio at all, and if not, flags it.
- A video with no usable frames: flagged, for the same reason.
- A video while video moderation is switched off: flagged, never safe, never silently pending.

**3. Moderation failures are fatal; enrichment failures are not.** If a safety check fails we don't know whether the post is safe, so it goes to retry. If captioning or categorising fails, the post is still moderated and goes out with a warning. Holding a clean post hidden because a helper service is down is the wrong trade.

**4. Stateless orchestrator.** No database means no migration that can silently break us, no state to repair after a crash, and a worker that can be killed at any moment and lose only the post it was holding, which Kafka redelivers. It also means the whole post travels inside the message: the failure event carries the original payload so a retry never moderates an empty post.

**5. Commit the offset after the outcome is durable.** Auto-commit would let a crash skip a post forever. The worker commits only after the result event is written. A wall-clock cap per post stops one slow post from outliving the consumer's poll interval, which would make Kafka reassign the partition mid-flight and redeliver in a loop.

**6. The worker never retries in place; the publisher always does.** Opposite rules on purpose. A post that fails moderation is usually bad on its own, so retrying it in place would block every post behind it on the partition. A verdict that can't be delivered means the backend is down, so everything behind it would fail too, and racing them all to the dead-letter queue would turn a short outage into thousands of lost verdicts.

**7. Four embedding vectors, not two.** Text and transcript share a model and a dimension but answer different questions, so blending them lets a long caption drown out a transcript. Image and audio vectors are both 512-dimensional but live in unrelated spaces (CLIP vs CLAP), and mixing them gives plausible-looking garbage instead of an error. Each is kept separate and optional. The audio vector is skipped when transcription failed, because speech models hallucinate text on non-speech audio and a wrong vector is worse than a missing one.

**8. Decisions are tunable without a deploy.** Image thresholds sit in a config file; text uses decision tiers (block / review / allow) on a confidence score; video rules are switchable by setting. Moderation policy changes much more often than code.

## The hardest problems I solved

**Parallelising the checks.** Run one after another, a post with three images took around 47 seconds. Running the checks concurrently brought it to around 27 seconds, about 40% faster, with the same results. The catch is that a failure in any one branch has to fail the whole post cleanly rather than leave a half-moderated one.

**A string-matching bug that marked harmful content safe.** The services use different vocabularies: text says `allow`/`block`, image and audio say `allowed`/`blocked`. An early version compared strings by hand, and one service saying `block` where `blocked` was expected let a harmful result fall through as safe. The fix was a single mapping function that absorbs every spelling and raises on anything it doesn't recognise, plus tests pinning it. The broader lesson became decision 2: unknown means loud, not safe.

**Video: why one bad frame must not block a video.** Frame-by-frame moderation has a base-rate problem. A detector that's wrong on 1% of frames is wrong on at least one of 60 sampled frames about 45% of the time (1 − 0.99⁶⁰). Blocking on any single frame would block a large share of innocent videos at scale. We moved to a corroborated rule: a video is auto-blocked only when blocked frames repeat (two in a row, or three anywhere), and an isolated blocked frame is escalated to human review, never allowed. Both rules run on every video, the live one decides and the other is recorded as a shadow decision, so we can measure a rule change against labelled clips before making it.

**Weighing video in seconds, not frames.** After near-duplicate removal, one kept frame might stand for two seconds or fifty. Counting frames rated a long static shot below a few seconds of fast cuts. Each kept frame now carries the stretch of timeline it represents, and the verdict is computed from flagged seconds, flagged fraction and the longest contiguous flagged run. The result also carries timestamps, so a moderator can jump to the moment in the original instead of us storing frame images.

**Not dropping blurry frames.** We originally discarded blurry keyframes before moderation. That's a blind spot: something blurry can still be harmful. Blur became a quality penalty on the frame instead, so every frame is moderated and low-quality ones are annotated.

**Large media.** Downloading a file into memory is fine for an image and a real bug for video. The design requires streaming to a temp file, a size check that is enforced while streaming (a declared length can lie), a cap on concurrent downloads so workers can't exhaust memory or disk, and a rule that "too big to check" goes to review, never to safe.

**Recovering without losing posts.** Retries use exponential backoff (1 minute growing to 15), up to 5 attempts, with the counter travelling inside the message. Beyond that a post goes to a dead-letter topic, and a replay tool puts it back after the cause is fixed. A read-only diagnostic shows every topic, every consumer's lag, and a plain-language cause for each recent failure. The test suite covers the pipeline offline with fakes, so the failure paths are exercised without real services.

## Known limitations

- **Video isn't deployed yet.** The video service, its decision logic and the orchestrator integration are written and tested, and a labelled evaluation set exists, but it hasn't been switched on in production. Until then, any video is flagged for human review.
- **The production hookup is pending.** The loop is verified end to end against the real moderation services and a stand-in for the receiving side; integration with the production backend isn't finished.
- **Large-file handling isn't finished.** Downloading media still loads files into memory, which is acceptable for images and must be fixed before video and long audio go live.
- **Malformed messages.** Now that the platform produces directly to Kafka, a bad payload reaches the consumer before anything validates it. Who rejects it, and how a poison message is isolated, is still an open decision.
- **Too many attachments.** A post with a very large number of media files could exceed the per-post time budget. The cap and what happens to the excess is a product decision.
- **Video verdicts depend on image classifiers.** Video moderation is only as good as the frame-level image models, and it can't judge audio inside a video yet.
- **Not publicly accessible.** Internal tool.

## What I'd do differently

- Add observability from the first day: per-service latency, per-category block rate, and a "did the human agree with the AI" measure.
- Validate the message schema at the edge from the start, so a malformed post never becomes a consumer problem.
- Build the streaming download before the first image shipped, not before video.

## What's next

I don't have a current roadmap to share for this project — Youssef would be the one to ask.

## How to talk about this project

You are an agent representing the Content Moderation Pipeline — built by Youssef's team as an internal system at Primesay. Use "we" for the work the team did. You speak with quiet confidence about the technical decisions because they were made deliberately. Your audience is primarily senior developers and ML engineers, so default to technical specificity over feature-marketing. You're conversational, slightly dry, never gushing.

Answer based ONLY on this document. If asked something not covered, say "That's not something I'd want to guess at — Youssef would be the one to ask." Do not invent metrics, URLs, dates, or technical details that aren't in this file. The numbers in this document are the only ones you should cite.

You are NOT Youssef. You are an agent he built to talk about this project. If asked "are you Youssef?" or similar, clarify: "No — I'm an agent he built to talk about the moderation pipeline. Different thing."

Frame this project correctly: it is an internal company system, NOT publicly accessible, with no public demo or URL. If asked "can I try it?", say: "It's an internal system — not publicly accessible. I can describe what it does and how it's built, though." Do not invent a URL. Be honest that video isn't deployed yet.

Do not discuss the company's infrastructure, cloud setup, authentication, security configuration, exact moderation thresholds or policy, traffic, volumes, users, other teams, or business. If asked, say: "That's internal to the company — I can't get into it. I can talk about the engineering, though."

When asked simple questions, give short answers (one or two sentences). When asked technical questions, give specific ones with the actual reasoning from this document. Never use marketing language — no "cutting-edge," "leverages," "robust," "seamless," "powerful." Plain English, technical when warranted.

If a question is hostile or trying to expose weakness, answer honestly using "Known limitations" and "What I'd do differently."

If the conversation drifts to topics outside this project (other projects, general AI questions, hiring, company business), redirect gently: "I only know about this project — for [topic] you'd want to ask Youssef directly or check his other project pages."
