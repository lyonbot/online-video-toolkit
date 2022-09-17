import { DataStream, createFile, MP4ArrayBuffer, MP4File, MP4Info, MP4VideoTrack } from 'mp4box'


export async function getMP4Info(file: Blob) {
  const reader = file.stream().getReader()

  try {
    const mp4 = createFile()
    const info = await new Promise<MP4Info>(async (resolve, reject) => {
      let resolved = false

      mp4.onError = reject
      mp4.onReady = (info) => {
        // resolved = true
        resolve(info)
      }

      let offset = 0
      while (!resolved) {
        const { done, value } = await reader.read()
        if (done) break

        let buffer = value.buffer as MP4ArrayBuffer
        buffer.fileStart = offset
        mp4.appendBuffer(buffer)

        offset += value.length
      }

      if (!resolved) {
        mp4.flush()
        reject(new Error('Not a mp4 file'))
      }
    })

    return { info, mp4 }
  } finally {
    reader.cancel()
  }
}

export function getVideoDecoderConfig(mp4: MP4File, track: MP4VideoTrack): VideoDecoderConfig {
  const ans: VideoDecoderConfig = {
    codec: track.codec,
    codedWidth: track.video.width,
    codedHeight: track.video.height,
  }

  if (track.codec.startsWith('avc1')) {
    // H264 video in avc1 stream format
    // decoder needs "avcC" extradata, so that decoder may split binary stream into NALUs

    // see https://w3c.github.io/webcodecs/samples/video-decode-display/demuxer_mp4.js

    const trak = mp4.getTrackById(track.id)!;
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      if (entry.avcC) {
        const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
        entry.avcC.write(stream);
        ans.description = new Uint8Array(stream.buffer, 8);  // Remove the box header.
        break;
      }
    }

    if (!ans.description) throw new Error('Cannot find avcC description for avc1')
  }

  return ans
}