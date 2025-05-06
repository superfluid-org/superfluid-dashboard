Feature: Vesting page require receiver to claim test cases

  # All new vesting schedules will use v3
  @skip
  Scenario: Creating a vesting schedule with a cliff and with require receiver to claim toggle enabled
    Given HDWallet transactions are rejected
    And Transactional account dan is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    Then No received vesting schedules message is shown
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs valid vesting schedule details in the form and proceeds to the preview
    And Preview of the vesting schedule is shown correctly
    And User creates the vesting schedule
    And Transaction rejected error is shown

  # All new vesting schedules will use v3
  @skip
  Scenario: Creation form - Top up the vesting schedule
    Given Transactional account dan is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "Don’t forget to top up for the vesting schedule!Remember to top up your Super Token balance in time for the cliff amount and vesting stream." error is shown in the form

  Scenario: Deleting a vesting schedule
    Given HDWallet transactions are rejected
    And Transactional account dan is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User opens the vesting schedule they have created
    And User deletes the vesting schedule
    And Transaction rejected error is shown
