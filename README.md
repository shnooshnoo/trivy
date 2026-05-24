### Prerequisites:

1. Trivy should be installed locally as described [here](https://trivy.dev/docs/latest/getting-started/installation/)
2. Run redis on localhost:6379, eg using docker `docker run -p 6379:6379 redis`
3. Install dependencies by running `npm i` in project root and in `./ui`

### To start the app, run these two commands from root:
1. `npm start` - this command will spin up backend and make API available on http://localhost:3000. Can be replaced with `npm run build` && `npm run start:prod` instead to test with --max-old-space-size=150
2. `npm run start:ui` - spins up web UI on http://localhost:5173

### Notes

In the requirements it says that trivy should be outputting results to a JSON file.

However, this felt unnecessary because after processing is done this file should be cleaned up anyway.
So I thought instead of saving it to a file I'd optimize it and filter needed data in the stream as I iterate over vulnerability objects. Hope this is fine and saving to a file was not mandatory. 
