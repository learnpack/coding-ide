# Exercise IDE for the BreatheCode CLI

How to publish this package:

1. Build the bundle: 

```
npm run build
```

2. Compress the bundle into a tar.gz

```
npm run compress
```

This tar.gz will be downloaded by the learnpack editor when running for the first time.

3. OPTIONAL: only if you want to publish the version to eveyone immediatly: Modify the version number in the package.json, increase it.

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
