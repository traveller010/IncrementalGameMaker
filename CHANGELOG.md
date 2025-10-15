# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-14

### Added
- Initial project setup.
- Core UI for managing Resources and Generators.
- Feature to allow multiple resource costs for generators.
- Refactored cost management into a reusable `CostEditor.vue` component.
- Implemented a version number display in the UI header.
- Added `CHANGELOG.md`, `DESIGN.md`, and `ROADMAP.md` to the project.
- Implemented the foundational "Upgrades System" with a dedicated editor.
- Added validation and UI/UX improvements to the Formula Editor.

### Changed
- Updated the "Remove" button for costs to a "-" icon for UI consistency.
- Updated project version to `0.1.0` to reflect new features.

### Fixed
- Resolved a reactivity issue where adding a new cost did not update the UI correctly.
- Corrected the handling of `Decimal` objects in the `CostEditor` to prevent data conversion issues.
- Fixed failing unit tests and improved test coverage for new components.
- Resolved a missing import for `UpgradeBlueprint` in the store.