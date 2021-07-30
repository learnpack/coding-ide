# Exercise IDE for the BreatheCode CLI

## Running the project in localhost

Before you can run this project, you have to make sure you also have the learnpack CLI running, for example:

1. Download learnpack cli: `npm i learnpack -g`
2. Download a package using `learnpack install`
3. Start the learnpack server by running `learnpack start` on any exercise.
4. Usually the learnpack server runs on 3000, so probably you can test the learnpack server by typing http://localhost:3000/config
5. Now that you have learnpack running on port 3000 you can start start the coding ide development server by running `npm install` and then `npm run start` on the root of this repository.
6. Once the development server for this project is running you can test it by typing the following URL on the browser: 

```txt
http://localhost:8080/?host=http://localhost:3000
```


## How to publish this package:

1. Build the bundle: `npm run build`
2. Compress the bundle into a tar.gz: `npm run compress`

Note: This tar.gz will be downloaded by the learnpack editor when running for the first time.

3. OPTIONAL: only if you want to publish the version to everyone immediatly: Modify the version number in the package.json, increase it.

```json
{
  ...
  "version": "1.0.53",
  ...
}
```

P.D: if you don't update the package.json you can still try this editor version using the `-v` flag on the learnpack-cli like this: `$ learnpack start -v 1.0.54`

4. Commit to a tag with the same name of the version and push that tag into github.

```bash
git commit -m 'your message'
git tag 1.0.53
git push origin 1.0.53
```
