# Core 567

Personal blog, built with 11ty. Template derived from https://eleventy-excellent.netlify.app/


## Building and running

The easiest way to get started with this repository is to use Dev Containers. If you're using Visual Studio Code, install the Dev Container plugin and open this repository in a Dev Container. This will ensure you have all the tools required to build Core 567.

Next:
* `npm install` to install all library dependencies.
* `npm run dev:11ty` to build Core 567 for development. This will take care of serve the website at `localhost:8080`, and will watch source folders to rebuild automatically when there are changes.
* `npm run debug:11ty` is the same as `npm run dev:11ty`, but enables 11ty debug logs.
* `npm run build:11ty` to build the website for production deployment.
* `npm run favicons` to rebuild all favicons after making changes to the main website logo. The main website logo location can be configured with the `pathToSvgLogo` variable in `src/_data/meta.js`.
* `npm run clean` to delete all build artifacts.