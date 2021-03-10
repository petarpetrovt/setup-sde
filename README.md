# setup-sde

<p align="left">
    <a href="https://github.com/petarpetrovt/setup-sde/actions?query=workflow%3ABuild" alt="Build">
        <img alt="Build" src="https://github.com/petarpetrovt/setup-sde/workflows/Build/badge.svg?branch=master" />
    </a>
    <a href="https://github.com/petarpetrovt/setup-sde/actions?query=workflow%3ACodeQL" alt="CodeQL">
        <img alt="CodeQL" src="https://github.com/petarpetrovt/setup-sde/workflows/CodeQL/badge.svg?branch=master" />
    </a>
    <a href="https://github.com/petarpetrovt/setup-sde/graphs/contributors" alt="Contributors">
        <img alt="Contributors" src="https://img.shields.io/github/contributors/petarpetrovt/setup-sde?label=Contributors">
    </a>
</p>

This action sets up a Intel's SDE binaries for use in actions by:

* Accepting Intel's [What If Pre-Release License Agreement](https://software.intel.com/libs/apps/intel/licenseagreement/idzlicenseagreements/idzla-what-if-pre-release-license-agreement.html)
* Downloading and extracting SDE binaries
* Providing environment variable

## Usage

See [action.yml](action.yml)

```
- name: Setup SDE binaries
  uses: petarpetrovt/setup-sde@v1.1
  with:
    environmentVariableName: SDE_PATH
```

## Authors

* **Petar Petrov**

See also the list of [contributors](https://github.com/SharpPTP/setup-sde/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
