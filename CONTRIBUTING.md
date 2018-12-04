Want to contribute? Great! First, read this page — including the section on
licensing your contribution.

## Developing

After cloning the repository, use [npm] or [yarn] to install dependencies and
run package commands. Examples using npm but the same commands work with yarn:

* Run `npm install` to get all the dependencies.
* Run `npm test` to lint and test your changes.
* Run `npm run dist` to generate the minified version.
* Run `npm start` to spawn a web server and load the demo in a browser.

The demo allows you to test reporting errors from the local library with your
own API key and project ID, see the network tab of your browser dev tools for
the specific requests that get sent. Note you can expect to see
[CORS preflight requests] but the behaviour once deployed can vary.

## Code reviews

All submissions, including submissions by project members, require review. We
use Github pull requests for this purpose. Once submitted, [Travis CI] will
automatically run the tests on your change, please check that this passes.

Before you start working on a larger contribution, you should get in touch with
us first through the issue tracker with your idea so that we can help out and
possibly guide you. Coordinating up front makes it much easier to avoid
frustration later on.

## Licensing your contribution

Before we can use your code, you must sign the
[Google Individual Contributor License Agreement] or 'CLA', which you can do
online.

The CLA is necessary mainly because you own the copyright to your changes, even
after your contribution becomes part of our codebase, so we need your
permission to use and distribute your code. We also need to be sure of various
other things — for instance that you'll tell us if you know that your code
infringes on other people's patents. You don't have to sign the CLA until after
you've submitted your code for review and a member has approved it, but you
must do it before we can put your code into our codebase.

### Contributions by corporations

Contributions made by corporations are covered by a different agreement than
the one above, the [Software Grant and Corporate Contributor License Agreement].

## Creating a new release

* find and replace the version number package.json and commit
* create a new git tag: `git tag v0.0.x`
* push tag `git push --tags`
* Create a [GitHub Release]
* update on npm: `npm publish`
* update the README to use this new published version in setup instructions and commit


[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
[CORS preflight requests]: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
[Travis CI]: https://docs.travis-ci.com/
[Google Individual Contributor License Agreement]: https://cla.developers.google.com/about/google-individual
[Software Grant and Corporate Contributor License Agreement]: https://cla.developers.google.com/about/google-corporate
[GitHub Release]: https://github.com/GoogleCloudPlatform/stackdriver-errors-js/releases
