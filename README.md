# setup-sde

![Build](https://github.com/petarpetrovt/setup-sde/workflows/Build/badge.svg?branch=master)

This action sets up a Intel's SDE binaries for use in actions by:

* Accepting Intel's [What If Pre-Release License Agreement](https://software.intel.com/protected-download/267266/144917)
* Downloading and extracting SDE binaries
* Providing environment variable

## Usage

See [action.yml](action.yml)

```
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v0.6
  with:
    environmentVariableName: SDE_PATH
```

## Authors

* **Petar Petrov**

See also the list of [contributors](https://github.com/SharpPTP/setup-sde/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
