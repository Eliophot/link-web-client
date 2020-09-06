/* eslint-disable no-console, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/promise-function-async, @typescript-eslint/prefer-optional-chain */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const bfj = require('bfj');
const AdmZip = require('adm-zip');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');

const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = FileSizeReporter;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024; // eslint-disable-line
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024; // eslint-disable-line

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([ paths.appHtml, paths.appIndexJs ])) {
  process.exit(1);
}

// Process CLI arguments
const argvSliceStart = 2;
const argv = process.argv.slice(argvSliceStart);
const writeStatsJson = argv.includes('--stats');
const withoutDist = argv.includes('--no-dist');
const { version, hasVersion } = getVersionFromArgs(argv);

// Generate configuration
const config = configFactory('production');

checkBrowsers(paths.appPath, isInteractive)
  .then(() =>

    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    measureFileSizesBeforeBuild(paths.appBuild))
  .then((previousFileSizes) => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);

    // Merge with the public folder
    copyPublicFolder();

    // Start the webpack build
    return build(previousFileSizes);
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          `\nSearch for the ${
            chalk.underline(chalk.yellow('keywords'))
          } to learn more about each warning.`,
        );
        console.log(
          `To ignore, add ${
            chalk.cyan('// eslint-disable-next-line')
          } to the line before.\n`,
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
        hasVersion && replaceVersionPlaceholder(version);
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE,
      );
      console.log();
    },
    (err) => {
      console.log(chalk.red('Failed to compile.\n'));
      printBuildError(err);
      process.exit(1);
    },
  )
  .then(() => hasVersion && !withoutDist && zipDist(version))
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }

    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production build...');

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;

      if (err) {
        if (!err.message) {
          return reject(err);
        }

        messages = formatWebpackMessages({
          errors: [ err.message ],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true }),
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }

        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n',
          ),
        );

        return reject(new Error(messages.warnings.join('\n\n')));
      }

      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      };

      if (writeStatsJson) {
        return bfj // eslint-disable-line promise/no-promise-in-callback
          .write(`${paths.appBuild}/bundle-stats.json`, stats.toJson())
          .then(() => resolve(resolveArgs))
          .catch((error) => reject(new Error(error)));
      }

      return resolve(resolveArgs);
    });
  });
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  });
}

function zipDist(version) {
  const versionFileName = `./dist/shlink-web-client_${version}_dist.zip`;

  console.log(chalk.cyan(`Generating dist file for version ${chalk.bold(version)}...`));
  const zip = new AdmZip();

  try {
    if (fs.existsSync(versionFileName)) {
      fs.unlink(versionFileName);
    }

    zip.addLocalFolder('./build', `shlink-web-client_${version}_dist`);
    zip.writeZip(versionFileName);
    console.log(chalk.green('Dist file properly generated'));
  } catch (e) {
    console.log(chalk.red('An error occurred while generating dist file'));
    console.log(e);
  }
  console.log();
}

function getVersionFromArgs(argv) {
  const [ version ] = argv;

  return { version, hasVersion: !!version };
}

function replaceVersionPlaceholder(version) {
  const staticJsFilesPath = './build/static/js';
  const versionPlaceholder = '%_VERSION_%';

  const isMainFile = (file) => file.startsWith('main.') && file.endsWith('.js');
  const [ mainJsFile ] = fs.readdirSync(staticJsFilesPath).filter(isMainFile);
  const filePath = `${staticJsFilesPath}/${mainJsFile}`;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const replaced = fileContent.replace(versionPlaceholder, version);

  fs.writeFileSync(filePath, replaced, 'utf-8');
}
