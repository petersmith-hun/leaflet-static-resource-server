Feature: Test cases for management endpoints

  @PositiveScenario
  Scenario: Calling health check

    When calling the health check endpoint

    Then the application responds with HTTP status OK
     And the application status is UP

  @PositiveScenario
  Scenario: Calling the application info

    When calling the application info endpoint

    Then the reported application abbreviation is TEST-LSRS
     And the reported application name is [TEST] Leaflet Static Resource Server
