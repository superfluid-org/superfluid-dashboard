Feature: Vesting page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Vesting Page" is open without connecting a wallet
    Then Vesting page while a wallet is not connected screen is shown

  Scenario: Creation form - Existing schedule
    Given Transactional account john is connected to the dashboard on opsepolia
    And User clicks on the "vesting" navigation button
    And User clicks on the create vesting schedule button
    And User searches for "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" as a receiver

# And User selects "fUSDCx" as the super token to use for the stream
# And User inputs a date "1" "year" into the future into the vesting start date field
# And User clicks on the cliff date toggle
# And User inputs "1" as the cliff amount
# And User inputs "2" "year" as the cliff period
# And User inputs "3" as the total vested amount
# And User inputs "4" "year" as the total vesting period
# Then "There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted." error is shown in the form