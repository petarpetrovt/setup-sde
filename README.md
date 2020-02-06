# setup-sde

![Build](https://github.com/petarpetrovt/setup-sde/workflows/Build/badge.svg?branch=master)

This action sets up a Intel's SDE binaries for use in actions by:

* accepting Intel's [What If Pre-Release License Agreement](https://software.intel.com/protected-download/267266/144917)
* downloading SDE binaries for current platform
* TODO: caching a version of SDE by (version and|or os) and adding to PATH

## Usage

See [action.yml](https://github.com/petarpetrovt/setup-sde/.github/actions/setup-sde/action.yml)

```
steps:
- uses: petarpetrovt/setup-sde@v0.3-alpha
  with:
    environmentVariableName: 'SDE_PATH' # USE SDE_PATH variable
```

## Authors

* **Petar Petrov**

See also the list of [contributors](https://github.com/SharpPTP/setup-sde/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
