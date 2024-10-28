Feature: Vesting page require receiver to claim test cases

  Scenario: Creation form - Cannot vest to yourself with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0x9B6157d44134b21D934468B8bf709294cB298aa7" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fDAIx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "You can’t vest to yourself. Choose a different wallet." error is shown in the form

  Scenario: Creation form - Cliff amount has to be less than total amount with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fDAIx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "3" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "1" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "Cliff amount has to be less than total amount." error is shown in the form

  Scenario: Creation form - Top-up warning message with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    Then The top-up warning message without cliff is shown
    And User clicks on the cliff date toggle
    Then The top-up warning message when cliff is enabled is shown

  Scenario: Creation form - Cliff amount period has to be before total vesting period with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "3" as the cliff amount
    And User inputs "4" "year" as the cliff period
    And User inputs "1" as the total vested amount
    And User inputs "1" "year" as the total vesting period
    Then "The vesting end date has to be at least 420 minutes from the start or the cliff." error is shown in the form

  Scenario: Creation form - Total vesting period has to be atleast 420 minutes after start with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "30" "minute" as the cliff period
    And User inputs "2" as the total vested amount
    And User inputs "59" "minute" as the total vesting period
    Then "The vesting end date has to be at least 420 minutes from the start or the cliff." error is shown in the form

  Scenario: Creation form - Vesting period less than 10 years with require receiver to claim toggle enabled
    Given Transactional account bob is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User inputs "2" as the total vested amount
    And User inputs "11" "year" as the total vesting period
    Then "The vesting period has to be less than 10 years." error is shown in the form

  Scenario: Creation form - Existing schedule with require receiver to claim toggle enabled
    Given Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs a date "1" "year" into the future into the vesting start date field
    And User clicks on the cliff date toggle
    And User inputs "1" as the cliff amount
    And User inputs "2" "year" as the cliff period
    And User inputs "3" as the total vested amount
    And User inputs "4" "year" as the total vesting period
    Then "There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted." error is shown in the form

  Scenario: Creating a vesting schedule with a cliff and with require receiver to claim toggle enabled
    Given HDWallet transactions are rejected
    And Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    Then No received vesting schedules message is shown
    And User deletes the vesting schedule if necessary
    And User clicks on the create vesting schedule button
    And User clicks on switch to v2
    And User searches for "0x1dDc50A8b8ef07c654B4ace65070B0E7acfF622B" as a receiver
    And User click on the require receiver to claim toggle
    And User selects "fTUSDx" as the super token to use for the stream
    And User inputs valid vesting schedule details in the form and proceeds to the preview
    And Preview of the vesting schedule is shown correctly
    And User creates the vesting schedule
    And Transaction rejected error is shown
