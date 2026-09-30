# Privacy Policy & Living Trust Standard

**Effective Date**: September 27, 2026  
**Project**: Muninn  
**Author & Maintainer**: Erebus ([kshitiz23kumar@gmail.com](mailto:kshitiz23kumar@gmail.com))  
**Repository**: [github.com/Erebuzzz/Muninn](https://github.com/Erebuzzz/Muninn)

---

## 1. Our Privacy Philosophy

Muninn is engineered as a living memory companion for technical work, founded on a single immutable principle:
> *"You decide what gets heard. We decide what is worth remembering."*

We believe that personal and professional conversations are sacred. Knowledge extraction must never come at the cost of surveillance, background tracking, or unauthorized model training.

---

## 2. Capture Is Explicitly Opt-In

- **No Ambient Listening**: Muninn never records audio or captures transcripts passively in the background. Capture is initiated solely when the user clicks or taps the microphone.
- **Visual & System Status**: On Android and tablet devices, an ongoing persistent notification is displayed prominently whenever audio capture is active, ensuring complete awareness and zero hidden recording.

---

## 3. Dual Storage Architecture

Muninn enforces two distinct storage boundaries depending on your runtime environment:

### A. Web Browser Guest Mode (Ephemeral Sandbox)
- Guest sessions operate in volatile browser memory (`sessionStorage`).
- Closing the browser tab or browser window immediately clears all session transcripts, extracted claims, and relational graphs.
- Server storage and cross-device synchronization are only activated if you choose to authenticate.

### B. Android Tablet APK (Hardware Local-First)
- Sign-in is completely optional on tablet hardware.
- Captured sessions, transcripts, and relational knowledge graphs are persisted locally on device storage via native Android SharedPreferences.
- Full functionality operates with zero network dependency.
- Cloud backup is user-controlled and optional.

---

## 4. Sensitivity & Privacy Review Gate

All extracted statements pass through an automated sensitivity filter. Statements containing:
- API keys, credentials, or passwords
- Off-the-record or privileged remarks
- Confidential pricing or financial values
- Sensitive personal health or private identifiers

Are quarantined into the **Sensitivity Gate**. Under our **Default-Discard** policy, quarantined statements are never committed to permanent memory unless you explicitly review and approve them.

---

## 5. Third-Party Services & AI Processing

- **AssemblyAI Realtime Engine & LLM Gateway**: Acoustic downsampling (24kHz PCM16) streams securely over encrypted TLS connections.
- **Zero Model Training**: Audio streams and temporary transcription buffers are processed in memory and are never sold, leased, or used to train third-party public foundation models.

---

## 6. Data Deletion & Rights

You retain full ownership of your data at all times. You can:
1. Export all crystallized claims and sessions in JSON format.
2. Delete individual claims, sessions, or purge your entire memory vault.
3. In local APK mode, clear app data in Android system settings to permanently wipe all local storage.

---

## 7. Contact Information

For any privacy inquiries or data requests, please contact:
- **Email**: [kshitiz23kumar@gmail.com](mailto:kshitiz23kumar@gmail.com)
- **GitHub**: [github.com/Erebuzzz](https://github.com/Erebuzzz)
