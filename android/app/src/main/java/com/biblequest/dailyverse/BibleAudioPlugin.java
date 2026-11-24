package com.biblequest.dailyverse;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "BibleAudio")
public class BibleAudioPlugin extends Plugin implements TextToSpeech.OnInitListener {

    private final Object ttsLock = new Object();
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private boolean ttsInitFailed = false;
    private boolean ttsInitializing = false;

    private PluginCall pendingCall = null;
    private String pendingText = null;
    private String pendingLocale = "en-US";
    private float pendingPitch = 1.0f;
    private float pendingRate = 1.0f;
    private String pendingGender = "female";

    private PluginCall activeSpeakCall = null;
    private String activeUtteranceId = null;

    private final ExecutorService chimeExecutor = Executors.newSingleThreadExecutor();

    @Override
    public void load() {
        super.load();
        ensureTtsInitialized();
    }

    private void ensureTtsInitialized() {
        synchronized (ttsLock) {
            if (tts != null || ttsInitializing) {
                return;
            }
            ttsInitializing = true;
            ttsInitFailed = false;
            ttsReady = false;
            tts = new TextToSpeech(getContext().getApplicationContext(), this);
        }
    }

    @Override
    public void onInit(int status) {
        PluginCall queuedCall = null;
        String queuedText = null;
        String queuedLocale = "en-US";
        float queuedPitch = 1.0f;
        float queuedRate = 1.0f;
        String queuedGender = "female";

        synchronized (ttsLock) {
            ttsInitializing = false;
            if (status == TextToSpeech.SUCCESS && tts != null) {
                ttsReady = true;
                ttsInitFailed = false;

                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
                tts.setAudioAttributes(attrs);

                tts.setOnUtteranceProgressListener(
                    new UtteranceProgressListener() {
                        @Override
                        public void onStart(String utteranceId) {}

                        @Override
                        public void onDone(String utteranceId) {
                            resolveActiveCall(utteranceId, true);
                        }

                        @Override
                        public void onStop(String utteranceId, boolean interrupted) {
                            resolveActiveCall(utteranceId, false);
                        }

                        @Override
                        @Deprecated
                        public void onError(String utteranceId) {
                            resolveActiveCall(utteranceId, false);
                        }

                        @Override
                        public void onError(String utteranceId, int errorCode) {
                            resolveActiveCall(utteranceId, false);
                        }
                    }
                );

                queuedCall = pendingCall;
                queuedText = pendingText;
                queuedLocale = pendingLocale;
                queuedPitch = pendingPitch;
                queuedRate = pendingRate;
                queuedGender = pendingGender;
                pendingCall = null;
                pendingText = null;
            } else {
                ttsReady = false;
                ttsInitFailed = true;
                queuedCall = pendingCall;
                pendingCall = null;
                pendingText = null;
            }
        }

        if (queuedCall != null) {
            if (ttsReady && queuedText != null) {
                startSpeakingInternal(
                    queuedCall,
                    queuedText,
                    queuedLocale,
                    queuedPitch,
                    queuedRate,
                    queuedGender
                );
            } else {
                JSObject res = new JSObject();
                res.put("completed", false);
                res.put("unavailable", true);
                queuedCall.resolve(res);
            }
        }
    }

    private void resolveActiveCall(String utteranceId, boolean completed) {
        PluginCall callToResolve = null;
        synchronized (ttsLock) {
            if (
                activeSpeakCall != null &&
                (utteranceId == null || utteranceId.equals(activeUtteranceId))
            ) {
                callToResolve = activeSpeakCall;
                activeSpeakCall = null;
                activeUtteranceId = null;
            }
        }
        if (callToResolve != null) {
            JSObject result = new JSObject();
            result.put("completed", completed);
            callToResolve.resolve(result);
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        if (text == null || text.trim().isEmpty()) {
            JSObject res = new JSObject();
            res.put("completed", true);
            call.resolve(res);
            return;
        }

        String localeTag = call.getString("locale", "en-US");
        Float pitchObj = call.getFloat("pitch", 1.0f);
        Float rateObj = call.getFloat("rate", 1.0f);
        float pitch = pitchObj != null ? Math.max(0.6f, Math.min(1.85f, pitchObj)) : 1.0f;
        float rate = rateObj != null ? Math.max(0.6f, Math.min(1.4f, rateObj)) : 1.0f;
        String voiceGender = call.getString("voiceGender", "female");

        synchronized (ttsLock) {
            if (ttsInitFailed) {
                tts = null;
                ttsInitFailed = false;
            }
            if (tts == null && !ttsInitializing) {
                ensureTtsInitialized();
            }

            if (pendingCall != null) {
                JSObject canceled = new JSObject();
                canceled.put("completed", false);
                pendingCall.resolve(canceled);
                pendingCall = null;
                pendingText = null;
            }

            if (activeSpeakCall != null) {
                JSObject canceled = new JSObject();
                canceled.put("completed", false);
                activeSpeakCall.resolve(canceled);
                activeSpeakCall = null;
                activeUtteranceId = null;
            }

            if (!ttsReady) {
                pendingCall = call;
                pendingText = text;
                pendingLocale = localeTag != null ? localeTag : "en-US";
                pendingPitch = pitch;
                pendingRate = rate;
                pendingGender = voiceGender != null ? voiceGender : "female";
                return;
            }
        }

        startSpeakingInternal(
            call,
            text,
            localeTag != null ? localeTag : "en-US",
            pitch,
            rate,
            voiceGender != null ? voiceGender : "female"
        );
    }

    private void startSpeakingInternal(
        PluginCall call,
        String text,
        String localeTag,
        float pitch,
        float rate,
        String voiceGender
    ) {
        synchronized (ttsLock) {
            if (tts == null || !ttsReady) {
                JSObject res = new JSObject();
                res.put("completed", false);
                res.put("unavailable", true);
                call.resolve(res);
                return;
            }

            Locale targetLocale = Locale.forLanguageTag(localeTag);
            int langResult = tts.setLanguage(targetLocale);
            if (
                langResult == TextToSpeech.LANG_MISSING_DATA ||
                langResult == TextToSpeech.LANG_NOT_SUPPORTED
            ) {
                String langPrefix = localeTag.contains("-")
                    ? localeTag.split("-")[0]
                    : localeTag;
                int baseResult = tts.setLanguage(new Locale(langPrefix));
                if (
                    baseResult == TextToSpeech.LANG_MISSING_DATA ||
                    baseResult == TextToSpeech.LANG_NOT_SUPPORTED
                ) {
                    tts.setLanguage(Locale.US);
                }
            }

            selectMatchingVoiceLocked(targetLocale, voiceGender);

            tts.setPitch(pitch);
            tts.setSpeechRate(rate);

            String utteranceId = UUID.randomUUID().toString();
            activeSpeakCall = call;
            activeUtteranceId = utteranceId;

            Bundle params = new Bundle();
            params.putString(
                TextToSpeech.Engine.KEY_PARAM_STREAM,
                String.valueOf(AudioManager.STREAM_MUSIC)
            );

            int speakResult = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
            if (speakResult == TextToSpeech.ERROR) {
                activeSpeakCall = null;
                activeUtteranceId = null;
                JSObject errRes = new JSObject();
                errRes.put("completed", false);
                errRes.put("error", true);
                call.resolve(errRes);
            }
        }
    }

    private void selectMatchingVoiceLocked(Locale targetLocale, String voiceGender) {
        if (tts == null) return;
        try {
            Set<Voice> voices = tts.getVoices();
            if (voices == null || voices.isEmpty()) return;

            String targetLang = targetLocale.getLanguage().toLowerCase(Locale.ROOT);
            List<Voice> candidates = new ArrayList<>();
            for (Voice v : voices) {
                if (v == null || v.getLocale() == null) continue;
                String vLang = v.getLocale().getLanguage().toLowerCase(Locale.ROOT);
                if (vLang.equals(targetLang)) {
                    candidates.add(v);
                }
            }
            if (candidates.isEmpty()) return;

            Voice best = null;
            int bestScore = Integer.MIN_VALUE;
            boolean wantMale = "male".equalsIgnoreCase(voiceGender);

            for (Voice v : candidates) {
                int score = 0;
                String name = v.getName() != null ? v.getName().toLowerCase(Locale.ROOT) : "";
                if (!v.isNetworkConnectionRequired()) score += 30;
                if (v.getQuality() >= Voice.QUALITY_HIGH) score += 20;
                if (
                    v.getLocale().getCountry() != null &&
                    v.getLocale().getCountry().equalsIgnoreCase(targetLocale.getCountry())
                ) {
                    score += 15;
                }

                boolean looksMale =
                    name.contains("male") ||
                    name.contains("-m-") ||
                    name.contains("#male") ||
                    name.contains("iol") ||
                    name.contains("sfg") ||
                    name.contains("iom");
                boolean looksFemale =
                    name.contains("female") ||
                    name.contains("-f-") ||
                    name.contains("#female") ||
                    name.contains("tpf") ||
                    name.contains("iob");

                if (wantMale) {
                    if (looksMale) score += 45;
                    if (looksFemale) score -= 30;
                } else {
                    if (looksFemale) score += 45;
                    if (looksMale) score -= 30;
                }

                if (score > bestScore) {
                    bestScore = score;
                    best = v;
                }
            }

            if (best != null) {
                tts.setVoice(best);
            }
        } catch (Exception ignored) {
            // Fallback to default TTS voice cleanly
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        synchronized (ttsLock) {
            if (pendingCall != null) {
                JSObject res = new JSObject();
                res.put("completed", false);
                pendingCall.resolve(res);
                pendingCall = null;
                pendingText = null;
            }
            if (activeSpeakCall != null) {
                JSObject res = new JSObject();
                res.put("completed", false);
                activeSpeakCall.resolve(res);
                activeSpeakCall = null;
                activeUtteranceId = null;
            }
            if (tts != null && ttsReady) {
                try {
                    tts.stop();
                } catch (Exception ignored) {}
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void playChime(PluginCall call) {
        String kind = call.getString("kind", "tap");
        final String safeKind = kind != null ? kind : "tap";
        chimeExecutor.execute(() -> playPcmChime(safeKind));
        call.resolve();
    }

    private void playPcmChime(String kind) {
        final int sampleRate = 22050;
        final double[][] notes;

        if ("correct".equals(kind)) {
            notes = new double[][] {
                { 523.25, 0.0, 0.14, 0.28 },
                { 659.25, 0.09, 0.16, 0.28 },
                { 783.99, 0.18, 0.24, 0.32 },
            };
        } else if ("wrong".equals(kind)) {
            notes = new double[][] {
                { 310.0, 0.0, 0.16, 0.24 },
                { 245.0, 0.13, 0.22, 0.24 },
            };
        } else if ("complete".equals(kind)) {
            notes = new double[][] {
                { 523.25, 0.0, 0.14, 0.26 },
                { 659.25, 0.1, 0.14, 0.26 },
                { 783.99, 0.2, 0.14, 0.26 },
                { 1046.5, 0.3, 0.36, 0.34 },
            };
        } else {
            notes = new double[][] {
                { 540.0, 0.0, 0.075, 0.16 },
            };
        }

        double maxEndSec = 0.1;
        for (double[] n : notes) {
            maxEndSec = Math.max(maxEndSec, n[1] + n[2] + 0.02);
        }

        int totalSamples = Math.max(1, (int) Math.ceil(maxEndSec * sampleRate));
        short[] pcm = new short[totalSamples];

        for (double[] note : notes) {
            double freq = note[0];
            double startSec = note[1];
            double durationSec = note[2];
            double amp = note[3];

            int startSample = (int) Math.floor(startSec * sampleRate);
            int noteSamples = (int) Math.floor(durationSec * sampleRate);
            int attackSamples = Math.max(1, (int) (0.015 * sampleRate));

            for (int i = 0; i < noteSamples && (startSample + i) < totalSamples; i++) {
                double t = (double) i / sampleRate;
                double env = i < attackSamples
                    ? (double) i / attackSamples
                    : Math.exp(-4.0 * ((double) (i - attackSamples) / Math.max(1, noteSamples - attackSamples)));
                double wave = Math.sin(2.0 * Math.PI * freq * t);
                int idx = startSample + i;
                int mixed = pcm[idx] + (int) (wave * env * amp * Short.MAX_VALUE);
                pcm[idx] = (short) Math.max(Short.MIN_VALUE, Math.min(Short.MAX_VALUE, mixed));
            }
        }

        AudioTrack track = null;
        try {
            AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            AudioFormat format = new AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .build();
            int byteCount = pcm.length * 2;
            track = new AudioTrack.Builder()
                .setAudioAttributes(attrs)
                .setAudioFormat(format)
                .setBufferSizeInBytes(byteCount)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build();

            track.write(pcm, 0, pcm.length);
            track.play();
            Thread.sleep((long) (maxEndSec * 1000L) + 30L);
        } catch (Exception ignored) {
            // Ignore audio hardware lock failures
        } finally {
            if (track != null) {
                try {
                    track.stop();
                } catch (Exception ignored) {}
                try {
                    track.release();
                } catch (Exception ignored) {}
            }
        }
    }

    @Override
    protected void handleOnDestroy() {
        synchronized (ttsLock) {
            if (tts != null) {
                try {
                    tts.stop();
                    tts.shutdown();
                } catch (Exception ignored) {}
                tts = null;
            }
            ttsReady = false;
        }
        chimeExecutor.shutdownNow();
        super.handleOnDestroy();
    }
}
