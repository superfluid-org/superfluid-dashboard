@numTestsKeptInMemory(0)
Feature: Vesting page second batch of test cases

  @mocked
  Scenario Outline: Vesting schedule statuses - <status>
    Given Vesting schedule status is mocked to <status>

    Given Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    Then The first vesting row in the table shows <status>

    Examples:
      | status         |
      | Transfer Error |
      | Overflow Error |
      | Vested         |
      | Vesting        |
      | Deleted        |
      | Stream Error   |
      | Cancel Error   |
      | Scheduled      |

  @mocked
  Scenario Outline: Schedule progress bar showing correctly for a scheduled vesting
    Given Vesting schedule progress is mocked to <state>

    Given Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User opens the vesting schedule they have created
    Then The schedule bar is correctly shown when it is in <state>

    Examples:
      | state           |
      | Scheduled       |
      | Vesting Started |
      | Cliff vested    |
      | Vesting ended   |

  Scenario: Vesting schedule aggregate stats
    Given Transactional account john is connected to the dashboard on polygon
    And User clicks on the "vesting" navigation button
    Then Total stats for the sent vesting schedules are shown correctly

  Scenario: Vesting schedule details page available without vesting code
    Given "Vesting details page" is open without connecting a wallet
    And Vesting details page is shown correctly for the created schedule

  Scenario: Token approval shown correctly when the schedule has ended
    Given "Dashboard Page" is open without connecting a wallet

    Given User uses view mode to look at "accountWithLotsOfData"
    And User changes their network to "polygon"
    And User clicks on the "vesting" navigation button
    And "StIbAlluoUSD" permissions icons are all "green"
    And User opens "StIbAlluoUSD" permission table row
    Then All current and recommended permissions are correctly showed for "StIbAlluoUSD"

  Scenario: Vesting schedule allowlist message - Try out on Optimism Sepolia testnet button
    Given Transactional account alice is connected to the dashboard on polygon
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    Then Vesting allowlist message is shown
    And User tries out vesting on Optimism Sepolia testnet
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period

  Scenario: Vesting schedule allowlist message for a user who is not allowlisted
    Given Transactional account alice is connected to the dashboard on polygon
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    Then Vesting allowlist message is shown

  Scenario: Setting up auto-wrap from the vesting form (rejected)
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "vijay.eth" as a receiver
    And User selects the first ENS recipient result
    And User selects "fDAIx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    And User clicks on the auto-wrap switch
    And User previews the vesting schedule
    And User clicks on the enable auto-wrap transaction button
    # And Auto-wrap transaction message is shown for "fDAIx" on "opsepolia"
    Then Transaction rejected error is shown

  Scenario: Auto-Wrap not available for native tokens in the vesting form
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User selects "ETHx" as the super token to use for the stream
    #The UI showing the Enable auto-wrap switch is not instant, waiting just to be sure it is not getting shown
    And User waits for 5 seconds
    Then Auto-wrap switch does not exist
