21:09:30.346 Running build in Washington, D.C., USA (East) – iad1
21:09:30.346 Build machine configuration: 2 cores, 8 GB
21:09:30.492 Cloning github.com/johnhay001-byte/my-resource-planner (Branch: main, Commit: c605580)
21:09:30.728 Cloning completed: 236.000ms
21:09:31.233 Restored build cache from previous deployment (Fr73yXYKfGYgcckgU5w9NdWMX6Xq)
21:09:31.761 Running "vercel build"
21:09:32.173 Vercel CLI 48.9.0
21:09:32.788 Installing dependencies...
21:09:34.129 
21:09:34.130 up to date in 1s
21:09:34.130 
21:09:34.131 135 packages are looking for funding
21:09:34.131   run `npm fund` for details
21:09:34.165 Running "npm run build"
21:09:34.293 
21:09:34.294 > my-resource-planner@0.0.1 build
21:09:34.294 > vite build
21:09:34.294 
21:09:35.262 [36mvite v4.5.14 [32mbuilding for production...[36m[39m
21:09:35.296 transforming...
21:09:36.583 [32m✓[39m 35 modules transformed.
21:09:36.584 [32m✓ built in 1.32s[39m
21:09:36.584 [31m[vite:esbuild] Transform failed with 1 error:
21:09:36.584 /vercel/path0/src/components/Icons.jsx:3:52: ERROR: Expected "=>" but found ";"[39m
21:09:36.585 file: [36m/vercel/path0/src/components/Icons.jsx:3:52[39m
21:09:36.585 [33m
21:09:36.585 [33mExpected "=>" but found ";"[33m
21:09:36.585 1  |  import React from 'react';
21:09:36.585 2  |  
21:09:36.585 3  |  export const PlusIcon = ({className}) => (/* ... */);
21:09:36.585    |                                                      ^
21:09:36.585 4  |  export const TrashIcon = ({ className }) => (/* ... */);
21:09:36.586 5  |  export const EditIcon = ({ className }) => (/* ... */);
21:09:36.586 [39m
21:09:36.586 [31merror during build:
21:09:36.586 Error: Transform failed with 1 error:
21:09:36.586 /vercel/path0/src/components/Icons.jsx:3:52: ERROR: Expected "=>" but found ";"
21:09:36.587     at failureErrorWithLog (/vercel/path0/node_modules/esbuild/lib/main.js:1649:15)
21:09:36.587     at /vercel/path0/node_modules/esbuild/lib/main.js:847:29
21:09:36.587     at responseCallbacks.<computed> (/vercel/path0/node_modules/esbuild/lib/main.js:703:9)
21:09:36.587     at handleIncomingPacket (/vercel/path0/node_modules/esbuild/lib/main.js:762:9)
21:09:36.587     at Socket.readFromStdout (/vercel/path0/node_modules/esbuild/lib/main.js:679:7)
21:09:36.587     at Socket.emit (node:events:519:28)
21:09:36.587     at addChunk (node:internal/streams/readable:561:12)
21:09:36.587     at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
21:09:36.588     at Readable.push (node:internal/streams/readable:392:5)
21:09:36.588     at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)[39m
21:09:36.605 Error: Command "npm run build" exited with 1