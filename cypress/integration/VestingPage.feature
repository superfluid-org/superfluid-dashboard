@vesting
Feature: Vesting page test cases

  Scenario: No vesting schedule messages
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    Then No received vesting schedules message is shown
    And No created vesting schedules message is shown

  Scenario: Vesting only available on supported networks
    Given Transactional account bob is connected to the dashboard on polygon-mumbai
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    Then "The feature is not available on this network." error is shown in the form

  Scenario: Creation form - Cannot vest to yourself
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0x9B6157d44134b21D934468B8bf709294cB298aa7" as a receiver
    And User selects "fDAIx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "Can not vest to yourself." error is shown in the form

  Scenario: Creation form - Cliff amount has to be less than total amount
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fDAIx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "3" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "1" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "Cliff amount has to be less than total amount." error is shown in the form

  Scenario: Creation form - Cliff amount period has to be before total vesting period
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "3" as the cliff amount
    And User inputs "4" "year" as the cliff period
    And User inputs "1" as the total vested amount
    And User inputs "1" "year" as the total vesting period
    Then "The vesting end date has to be at least 60 minutes from the start or the cliff." error is shown in the form

  Scenario: Creation form - Total vesting period has to be atleast 60 minutes after start
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "30" "minute" as the cliff period
    And User inputs "2" as the total vested amount
    And User inputs "59" "minute" as the total vesting period
    Then "The vesting end date has to be at least 60 minutes from the start or the cliff." error is shown in the form

  Scenario: Creation form - Vesting period less than 10 years
    Given Transactional account bob is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "minute" as the cliff period
    And User inputs "2" as the total vested amount
    And User inputs "11" "year" as the total vesting period
    Then "The vesting period has to be less than 10 years." error is shown in the form

  Scenario: Creation form - Existing schedule
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fUSDCx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted." error is shown in the form

  Scenario: Creating a vesting schedule with a cliff
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    Then No received vesting schedules message is shown
    #And User deletes the vesting schedule if necessary
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs valid vesting schedule details in the form and proceeds to the preview
    And Preview of the vesting schedule is shown correctly
    And User creates the vesting schedule
    And Transaction rejected error is shown
#   And The first vesting row in the table shows "Creating..." pending transaction status
#   And The first vesting row in the table shows "Syncing..." pending transaction status
#   And The restore button is not visible for the last transaction
#   And The newly created vesting schedule is visible in the table

  Scenario: Deleting a vesting schedule
    Given HDWallet transactions are rejected
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User opens the last vesting schedule they have created
    And User deletes the vesting schedule
    And Transaction rejected error is shown


  Scenario: Change network button showing up if user is not on goerli
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And User opens the last vesting schedule they have created
    And Delete vesting schedule button is visible
    And User changes their network to "polygon"
    And Delete vesting schedule button is not visible
    And Change to goerli button is visible in the vesting preview
    And User clicks on the change to goerli button
    And Delete vesting schedule button is visible

  Scenario: Sent vesting schedules details
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And The created vesting schedule is shown correctly in the table
    And User opens the last vesting schedule they have created
    And Vesting details page is shown correctly for the created schedule

  Scenario: Vesting schedules only available on Mainnet,Polygon,BNB and Goerli
    Given Transactional account john is connected to the dashboard on polygon-mumbai
    And User clicks on the "vesting" navigation button
    Then User sees network not supported screen in the vesting page
    And Mainnet network link is disabled

  Scenario: Vesting schedules only available on Mainnet,Polygon,BNB and Goerli - mainnet code enabled
    Given Transactional account john is connected to the dashboard on polygon-mumbai
    And User opens the navigation more menu
    And User opens the access code menu
    And User types "724ZX_ENS" in the access code menu
    And User submits the access code
    #Workaround, inputing the code from the network not supported screen will not enable the button
    And User clicks on the "vesting" navigation button
    And User clicks on the "ecosystem" navigation button
    Then Projects that are "automating crypto payroll" are shown
    And User clicks on the "vesting" navigation button
    Then User sees network not supported screen in the vesting page
    And Mainnet network link is enabled

  Scenario: Allowance table statuses
    Given Transactional account john is connected to the dashboard on goerli
    And User clicks on the "vesting" navigation button
    And "fUSDCx" permissions icons are all "green"
    And User opens "fUSDCx" permission table row
    Then All current and recommended permissions are correctly showed for "fUSDCx"
    And "fDAIx" permissions icons are all "red"
    And User opens "fDAIx" permission table row
    Then All current and recommended permissions are correctly showed for "fDAIx"

    @only
  Scenario Outline: Vesting schedule statuses
      Given Vesting schedule status is mocked to <status>
      Given Transactional account john is connected to the dashboard on goerli
      And User clicks on the "vesting" navigation button
      Then The first vesting row in the table shows <status>
      Examples:
      |status|
      |  Vesting    |
      |  Cliff    |
      | Stream Error          |
      | Vested   |
      |  Cancel Error        |
    |Overflow Error        |
      | Transfer Error                     |
      | Deleted                               |

  Scenario: Schedule progress bar showing correctly for a scheduled vesting