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

3. Modify the version number in the package.json, increase it.

```json
{
  ...
  "version": "1.0.53",
  ...
}
```

4. Commit to a tag with the same name of the version and push that tag into github.

```bash
git commit -m 'your message'
git tag 1.0.53
git push origin 1.0.53
```