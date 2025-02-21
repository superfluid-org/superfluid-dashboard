@numTestsKeptInMemory(0)
Feature: Vesting page third batch of test cases

  Scenario: Auto-Wrap not available for pure tokens in the vesting form
    And Transactional account john is connected to the dashboard on polygon
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User selects "NTDL" as the super token to use for the stream
    #The UI showing the Enable auto-wrap switch is not instant, waiting just to be sure it is not getting shown
    And User waits for 5 seconds
    Then Auto-wrap switch does not exist

  Scenario: Top up warning not shown if auto-wrap switch is enabled
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User selects "fDAIx" as the super token to use for the stream
    And User clicks on the auto-wrap switch
    Then Top up warning is not shown

  @skip
  @bug
  Scenario: Stop viewing address - Auto-wrap button
    Given "Dashboard page" is open using view mode to look at "john"
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "vijay.eth" as a receiver
    And User selects the first ENS recipient result
    And User selects "TDLx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    And User clicks on the auto-wrap switch
    And User previews the vesting schedule
    Then The stop viewing as an address button is visible
    And Enable auto-wrap button does not exist

  Scenario: Auto-wrap available to everyone on opsepolia
    And Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User selects "fDAIx" as the super token to use for the stream
    Then Auto-wrap switch is visible

  Scenario: Auto-wrap available to allowlisted addresses on mainnet
    And Transactional account john is connected to the dashboard on polygon
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User selects "DAIx" as the super token to use for the stream

  @skip
  @bug
  Scenario: Stop viewing address - Allowance button
    Given "Dashboard page" is open using view mode to look at "john"
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "FUNDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    And User clicks on the auto-wrap switch
    And User previews the vesting schedule
    And Give allowance button does not exist
    Then The stop viewing as an address button is visible

  @bug
  @skip
  Scenario: Setting up auto-wrap for a user who has already given ACL allowance(rejected)
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "vijay.eth" as a receiver
    And User selects the first ENS recipient result
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    And User clicks on the auto-wrap switch
    And User previews the vesting schedule
    And User clicks the Allowance button for the auto-wrap
    And Auto-wrap allowance transaction message is shown on "opsepolia"
    Then Transaction rejected error is shown

  Scenario: Auto-wrap switch not showing up for a user who already has auto-wrap set up
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "vijay.eth" as a receiver
    And User selects the first ENS recipient result
    And User selects "fUSDCx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    And User waits for 5 seconds
    Then Auto-wrap switch does not exist

  Scenario: No auto-wrap icon showing showing for pure super tokens
    Given "Dashboard page" is open using view mode to look at "accountWithLotsOfData"
    And User changes their network to "polygon"
    And User clicks on the "vesting" navigation button
    And User opens "NTDL" permission table row
    Then Auto-wrap icon for "NTDL" is "not existing"

  Scenario: No auto-wrap icon showing showing for native tokens
    Given "Dashboard page" is open using view mode to look at "accountWithLotsOfData"
    And User changes their network to "polygon"
    And User clicks on the "vesting" navigation button
    And User opens "POLx" permission table row
    Then Auto-wrap icon for "POLx" is "not existing"

  Scenario: Permissions table - Change network button - enabling auto-wrap
    Given "Dashboard Page" is open with "john" connected on "polygon"
    And User clicks on the "vesting" navigation button
    And User changes their network to "opsepolia"
    Then User opens "fTUSDx" permission table row
    Then Enable auto-wrap button is not visible
    And Switch network button is visible in the "fTUSDx" permission row

  Scenario: Permissions table - Change network button - disabling auto-wrap
    Given "Dashboard Page" is open with "john" connected on "polygon"
    And User clicks on the "vesting" navigation button
    And User changes their network to "opsepolia"
    Then User opens "fUSDCx" permission table row
    Then Disable auto-wrap button does not exist
    And Switch network button is visible in the "fUSDCx" permission row

  Scenario: Permissions table - Change network button - Fixing vesting permissions
    Given "Dashboard Page" is open with "john" connected on "polygon"
    And User clicks on the "vesting" navigation button
    And User changes their network to "opsepolia"
    Then User opens "fUSDCx" permission table row
    Then Fix permissions button does not exist
    And Switch network button is shown instead of fix permissions button

  Scenario: Permissions table - Stop viewing button - enabling auto-wrap
    Given "Dashboard page" is open using view mode to look at "john"
    And User changes their network to "opsepolia"
    And User clicks on the "vesting" navigation button
    Then User opens "fTUSDx" permission table row
    Then Enable auto-wrap button is not visible
    And Stop viewing button is visible in the "fTUSDx" permission row
    And User clicks on the stop viewing as an address button
    Then Vesting page while a wallet is not connected screen is shown

  Scenario: Permissions table - Stop viewing button - disabling auto-wrap
    Given "Dashboard page" is open using view mode to look at "john"
    And User changes their network to "opsepolia"
    And User clicks on the "vesting" navigation button
    Then User opens "fTUSDx" permission table row
    Then Disable auto-wrap button does not exist
    And Stop viewing button is visible in the "fTUSDx" permission row
    And User clicks on the stop viewing as an address button
    Then Vesting page while a wallet is not connected screen is shown

  Scenario: Invalid vesting page leading to a 404 page
    Given "404 Vesting Page" is open without connecting a wallet
    Then 404 page is shown
