import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";
import { isFFmpegLoaded, loadFFmpeg } from "../ffmpeg-client";

/** Lossy audio targets that accept a bitrate setting. */
const LOSSY = ["mp3", "aac", "m4a", "ogg", "opus"];

/**
 * Audio converter (Phase 3) — transcodes between audio formats with ffmpeg.wasm.
 *
 * ffmpeg runs in its own worker (loaded from the self-hosted core), so this runs on the main
 * thread without freezing the UI. Codec selection is inferred from the output extension
 * (mp3→libmp3lame, ogg→libvorbis, opus→libopus, m4a/aac→aac, flac→flac, wav→pcm).
 */
export const audioConverter: Converter = {
  id: "audio-transcode",
  category: "audio",
  runtime: "client",
  status: "available",
  from: ["mp3", "wav", "aac", "m4a", "ogg", "opus", "flac"],
  to: ["mp3", "wav", "aac", "m4a", "ogg", "opus", "flac"],
  options: [
    {
      id: "bitrate",
      type: "range",
      label: "Bitrate",
      min: 64,
      max: 320,
      step: 32,
      default: 192,
      unit: " kbps",
      appliesTo: LOSSY,
    },
  ],
  async convert({ file, from, to, options, onProgress }: ConversionInput): Promise<ConversionResult> {
    // The 32 MB core downloads on first use — let the user know why it's pausing.
    onProgress?.({
      ratio: 0,
      stage: isFFmpegLoaded() ? "Preparing" : "Loading converter (first run, ~32 MB)…",
    });

    let ffmpeg;
    try {
      ffmpeg = await loadFFmpeg();
    } catch (err) {
      throw new Error(`Couldn't load the conversion engine. ${err instanceof Error ? err.message : err}`);
    }

    const { fetchFile } = await import("@ffmpeg/util");

    // Capture ffmpeg's own log so failures report the actual reason (e.g. "Unknown encoder").
    const logTail: string[] = [];
    const onLog = (e: { message: string }) => {
      logTail.push(e.message);
      if (logTail.length > 15) logTail.shift();
    };
    const onFfmpegProgress = (e: { progress: number }) =>
      onProgress?.({ ratio: Math.min(1, Math.max(0, e.progress)), stage: "Converting" });
    ffmpeg.on("log", onLog);
    ffmpeg.on("progress", onFfmpegProgress);

    const inputName = `input${from.ext}`;
    const outputName = `output${to.ext}`;
    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args = ["-i", inputName, "-vn"];
      if (LOSSY.includes(to.id)) args.push("-b:a", `${Number(options?.bitrate ?? 192)}k`);
      args.push(outputName);

      const code = await ffmpeg.exec(args);
      if (code !== 0) {
        const reason = logTail.filter((l) => /error|invalid|unknown|unable|no such/i.test(l)).slice(-3);
        throw new Error(
          `Conversion failed (ffmpeg exit ${code}).` +
            (reason.length ? ` ${reason.join(" ")}` : ` ${logTail.slice(-3).join(" ")}`),
        );
      }

      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      if (!data || data.byteLength === 0) throw new Error("Conversion produced an empty file.");
      onProgress?.({ ratio: 1, stage: "Done" });

      // Copy into a plain ArrayBuffer-backed array so it's a valid BlobPart.
      const bytes = new Uint8Array(data.byteLength);
      bytes.set(data);
      return { blob: new Blob([bytes], { type: to.mime }), filename: brandedFilename(file.name, to.ext) };
    } finally {
      ffmpeg.off("progress", onFfmpegProgress);
      ffmpeg.off("log", onLog);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    }
  },
};
