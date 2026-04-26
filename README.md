 # setup-sde

[![Build](https://github.com/petarpetrovt/setup-sde/actions/workflows/build.yml/badge.svg)](https://github.com/petarpetrovt/setup-sde/actions/workflows/build.yml) [![CodeQL](https://github.com/petarpetrovt/setup-sde/actions/workflows/codeql.yml/badge.svg)](https://github.com/petarpetrovt/setup-sde/actions/workflows/codeql.yml) [![Contributors](https://img.shields.io/github/contributors/petarpetrovt/setup-sde?label=Contributors)](https://github.com/petarpetrovt/setup-sde/graphs/contributors)

This action sets up Intel's SDE binaries for use in actions by:

* Downloading and extracting SDE binaries
* Providing environment variable

## Usage

See [action.yml](action.yml)

```YML
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v4.0
```

> Use the latest version, since Intel regularly removes older mirror links.

```YML
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v4.0
  with:
    environmentVariableName: MY_CUSTOM_NAME # default value is `SDE_PATH`
    sdeVersion: 10.8.0 # possible values: 10.8.0 (default), 9.58.0
```

> Works only for windows and linux.

## Authors

* **Petar Petrov**

See also the list of [contributors](https://github.com/petarpetrovt/setup-sde/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
