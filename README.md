# WebDevAssignment_1

Comp2537 Web development assignment 1

2026 May 5: 
I still have the problem on image, but studio 3T and deploy works for now.
===============================================================
2026 May 4:
Most of the request are done. (80% task)

Problem: There are four main things is not working for the whole time.

1.  connection between studio 3T and mongoDB is not working at all since I am oversea. I made connection between mongoDB with studio 3T, but when it run. It says the
    This is the error message from studio 3T:
    Database error (MongoConfigurationException): Failed looking up SRV record for '\_mongodb.\_tcp.wevdevpracticedb.pzq4s.mongodb.net'.

Stacktrace:
|\_/ Database error (MongoConfigurationException): Failed looking up SRV record for '\_mongodb.\_tcp.wevdevpracticedb.pzq4s.mongodb.net'.
|\_**\_/ com.mongodb.spi.dns.DnsWithResponseCodeException: DNS name not found [response code 3]
|**\_****/ javax.naming.NameNotFoundException: DNS name not found [response code 3]; remaining name '\_mongodb.\_tcp.wevdevpracticedb.pzq4s.mongodb.net'

2.  my image are not showing. I tried many time to change or delete "/", change images. This take me very long time.

This is the console:
Failed to load resource: the server responded with a status of 404 (Not Found)

3. 404 page is not working in my VSCode at the beginnig, now works. But I like to show what's the problem I met.
   =========This is my code ==============
   404 page – site: any non-assigned URLs method: GET
   app.get("_", (req, res) => {
   res.status(404);
   res.send("Page not found-404");
   });
   =======================================
   This is problem I received, but I try to change "_" to '_' and try to find any other _ in my code. But I can't find any. I think it is hidden.

vivian90413@Vivians-MacBook-Pro WebDevAssignment_1 % node app.js
◇ injected env (6) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:108
throw new PathError(`Missing parameter name at index ${index}`, str);
^

PathError [TypeError]: Missing parameter name at index 1: _; visit https://git.new/pathToRegexpError for info
at consumeUntil (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:108:27)
at parse (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:140:26)
at process (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:263:56)
at pathToRegexp (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:274:5)
at Object.match (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/path-to-regexp/dist/index.js:225:30)
at matcher (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/router/lib/layer.js:86:23)
at new Layer (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/router/lib/layer.js:93:62)
at router.route (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/router/index.js:428:17)
at app.route (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/express/lib/application.js:257:22)
at app.<computed> [as get] (/Users/vivian90413/Documents/Documents - Vivian’s MacBook Pro/BCIT/Term_1/2537_webDev/7_Assignment/WebDevAssignment_1/node_modules/express/lib/application.js:478:22) {
originalPath: '_'
}

4.deploy for many times and it is not working.

error message:
connection error: MongoServerError: bad auth : Authentication failed.
at Connection.sendCommand (/opt/render/project/src/node_modules/mongodb/lib/cmap/connection.js:320:27)
at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
at async Connection.command (/opt/render/project/src/node_modules/mongodb/lib/cmap/connection.js:347:26)
at async executeScram (/opt/render/project/src/node_modules/mongodb/lib/cmap/auth/scram.js:78:22)
at async ScramSHA256.auth (/opt/render/project/src/node_modules/mongodb/lib/cmap/auth/scram.js:38:16)
at async performInitialHandshake (/opt/render/project/src/node_modules/mongodb/lib/cmap/connect.js:110:13)
at async connect (/opt/render/project/src/node_modules/mongodb/lib/cmap/connect.js:28:9) {
errorLabelSet: Set(2) { 'HandshakeError', 'ResetPool' },
errorResponse: {
ok: 0,
errmsg: 'bad auth : Authentication failed.',
code: 8000,
codeName: 'AtlasError'
},
ok: 0,
code: 8000,
codeName: 'AtlasError',
connectionGeneration: 0
}
node:internal/process/promises:394
triggerUncaughtException(err, true /_ fromPromise _/);
^
MongoServerError: bad auth : Authentication failed.
at Connection.sendCommand (/opt/render/project/src/node_modules/mongodb/lib/cmap/connection.js:320:27)
at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
at async Connection.command (/opt/render/project/src/node_modules/mongodb/lib/cmap/connection.js:347:26)
at async executeScram (/opt/render/project/src/node_modules/mongodb/lib/cmap/auth/scram.js:78:22)
at async ScramSHA256.auth (/opt/render/project/src/node_modules/mongodb/lib/cmap/auth/scram.js:38:16)
at async performInitialHandshake (/opt/render/project/src/node_modules/mongodb/lib/cmap/connect.js:110:13)
at async connect (/opt/render/project/src/node_modules/mongodb/lib/cmap/connect.js:28:9) {
errorLabelSet: Set(2) { 'HandshakeError', 'ResetPool' },
errorResponse: {
ok: 0,
errmsg: 'bad auth : Authentication failed.',
code: 8000,
codeName: 'AtlasError'
},
ok: 0,
code: 8000,
codeName: 'AtlasError',
connectionGeneration: 0
}
Node.js v24.14.1
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
