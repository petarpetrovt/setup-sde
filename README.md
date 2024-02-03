 # setup-sde

[![Build](https://github.com/petarpetrovt/setup-sde/actions/workflows/build.yml/badge.svg)](https://github.com/petarpetrovt/setup-sde/actions/workflows/build.yml) [![CodeQL](https://github.com/petarpetrovt/setup-sde/actions/workflows/codeql.yml/badge.svg)](https://github.com/petarpetrovt/setup-sde/actions/workflows/codeql.yml) [![Contributors](https://img.shields.io/github/contributors/petarpetrovt/setup-sde?label=Contributors)](https://github.com/petarpetrovt/setup-sde/graphs/contributors)

This action sets up Intel's SDE binaries for use in actions by:

* Downloading and extracting SDE binaries
* Providing environment variable

## Usage

See [action.yml](action.yml)

```YML
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v2.4
```

> Utilize the latest version, as Intel no longer offers mirror links for Intel SDE versions below `9.24.0`.

```YML
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v2.4
  with:
    environmentVariableName: MY_CUSTOM_NAME # default value is `SDE_PATH`
    sdeVersion: 9.33.0 # possible values: 9.33.0 (default), 9.27.0, 9.24.0, 9.14.0, 9.7.0, 9.0.0, 8.69.1
```

> Versions `>= 9.14.0` work only for windows and linux.

## Authors

* **Petar Petrov**

See also the list of [contributors](https://github.com/petarpetrovt/setup-sde/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
