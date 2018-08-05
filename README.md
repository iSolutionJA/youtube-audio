# Youtube Audio
Audio version of youtube

# Built With
Node.js,
Express.js, and
EJS as the templating language

# Installation Instruction
1. Clone repo
2. Make sure you have Node.js and npm installed
3. Open your os cli and navigate to the root directory of the project
4. Run "npm install"
5. Get a Youtube Data Api Key
6. Replace "process.env.API_KEY" in apiRequest.js(~line 9) with the key you've obtain
7. Save changes
8. Run "node app.js"
9. Visit localhost:3000 in your browser
10. You are finished!

# How is the audio streamed?

1. Get the duration(in seconds) of a video from the Youtube Data API
2. Calculate the file size in bytes using the duration and bitrate(125Kb/s) so we can tell the browser how long the file is.
3. Set the header(200) of the audio file that is going to be streamed; content-type - audio/mpeg, content-length - file-size and transfer-encoding - chuncked
4. Stream the file using a modified version of the youtube-audio-stream package to the response

# How does audio seeking work?

1. User clicks on a section of the seek bar
2. Browser sends request header with a range
3. Find start and end range (ths is in bytes)
4. Calculate the chunksize(length to stream in bytes)
4. Set the partial content header(206) for the requested range of the audio that is being streamed; content-type - audio/mpeg, accept-ranges - bytes, content-length - chunksize and content-range - 'bytes ' + start + '-' + end + '/' + durationInBytes
5. Calculate the start in seconds using the start in bytes
6. Stream the section starting from the start time in seconds using a modified version of the youtube-audio-stream package to the response

# youtube-audio-stream
npm - https://www.npmjs.com/package/youtube-audio-stream <br />
github - https://github.com/JamesKyburz/youtube-audio-stream

This package takes a videoId then converts the youtube video(mp4) to a mp3 then returns a stream object which can be used to create a file or to stream to some output. My customized version allows for the specification of where to start the stream.