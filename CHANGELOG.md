# Change Log
## 2.3.3 (May 25, 2016)
Features:
  - Support for nightwatch 0.9.0

## 2.2.3 (May 20, 2016)
Features:
  - standard updated to version 7.1.0
  - Support for cucumber 0.10.3
  - skiptags testcase added to nightwatch-tag-test

## 2.2.2 (May 17, 2016)
Bugfixes:
  - Fix json/html report generation on Windows

## 2.2.1 (May 4, 2016)
Features:
  - Skip remaining steps after client termination
  - Steps result handling improved
  - standard updated to version 7.0.0
  - snazzy updated to version 4.0.0

Bugfixes:
  - Fix steps printed multiple times for assertions

## 2.2.0 (April 30, 2016)
Features:
  - Cucumber HTML reports

Bugfixes:
  - Fix missing error message in cucumber json

## 2.1.7 (April 15, 2016)
Bugfixes:
  - Fix session closing after scenario

## 2.1.6 (April 8, 2016)
Bugfixes:
  - Scenario result handling fixed

## 2.1.5 (April 8, 2016)
Bugfixes:
  - Prevent json formatter output SyntaxError: Unexpected end of input

## 2.1.4 (April 1, 2016)
Features:
  - Support for cucumber 0.10.0

## 2.1.3 (March 20, 2016)
Features:
  - Simplify test dependencies
  - Make use of https://greenkeeper.io/

## 2.1.2 (March 16, 2016)
Bugfixes:
  - Fix ambiguous and undefined step logging

## 2.1.1 (March 13, 2016)
Features:
  - Log improved in Nighwatch runner mode
  - Reporter input improved in Nighwatch runner mode

## 2.0.1 (March 12, 2016)
Bugfixes:
  - Prevent JS error if there is no client result after command execution

## 2.0.0 (March 12, 2016)
Features:
  - Log improved in Nighwatch runner mode

## 1.5.1 (February 22, 2016)
Bugfixes:
  - Fix featureFiles option

## 1.5.0 (February 11, 2016)
Features:
  - Use runtime dependency check instead of peer package dependencies

## 1.4.0 (February 11, 2016)
Bugfixes:
  - Fix cucumber runner

## 1.3.3 (February 8, 2016)
Bugfixes:
  - Fix dependencies

## 1.3.2 (February 8, 2016)
Features:
  - Readme improved

## 1.3.1 (February 8, 2016)
Features:
  - Readme improved

## 1.3.0 (February 6, 2016)
Features:
  - Hooks support added
  - Feature background support added
  - Add feature name to output (Nightwatch.js as runner)

## 1.2.0 (February 6, 2016)
Features:
  - Scenario outlines support added

Bugfixes:
  - Fix undefined/ambiguous step handling

## 1.1.0 (January 28, 2016)
Features:
  - Keep browser instance open
  - Add TravisCI tests

## 1.0.2 (January 27, 2016)
Features:
  - Add Cucumber.js as runner support

## 0.6.7 (January 18, 2016)
Bugfixes:
  - Fix path issue on Windows systems

## 0.6.6 (January 17, 2016)
Features:
  - Use require.main.require instead of parent-require for requiring nightwatch

## 0.6.5 (January 17, 2016)
Features:
  - don't create temp-tests folder

## 0.6.3 (January 16, 2016)
Features:
  - added support for grouping features by placing them in same sub-folder
