Feature: Send Page test cases

  Scenario: Connect wallet button shown to a user who hasn't got their wallet connected
    Given "Send Page" is open without connecting a wallet
    And User fills all stream inputs "without" a wallet connected
    And Stream ending on and amount per second is shown correctly
    And Stream preview is shown correctly when user is not connected
    And User accepts the risk warning
    Then Send button is enabled and asks user to Connect their wallet

  Scenario: Receiver dialog recents and ENS support
    Given "Send Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the receiver dialog
    Then The recent receivers are shown on "polygon"
    And User closes the dialog
    Then The receiver dialog is not visible
    And User opens the receiver dialog
    Then And user selects the first recent receiver
    Then The receiver address is shown as the chosen receiver in the send stream page
    And User searches for "vijay.eth" as a receiver
    Then "0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac" is visible in the ENS recipient results
    And User selects the first ENS recipient result
    Then Chosen wallet address shows up as vijay.eth
    And User clears the receiver field with the close button

  @skip
  Scenario: Super token selection , balances and wrap buttons
    Given "Send Page" is open with "staticBalanceAccount" connected on "gnosis"
    And User connects their wallet to the dashboard
    And User changes their network to "polygon"
    And User opens the token selection screen
    Then Super token balances are shown correctly for "staticBalanceAccount" on "polygon"
    And All of the tokens shown have an animation around them
    And The user clicks on the "MATICx" wrap button
    Then The user is redirected to the wrap page and "MATICx" is selected
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User selects "MATICx" as the super token to use for the stream
    Then Token balance is shown correctly in the send stream page with a wrap button next to it
    And User clicks on the wrap button in the send stream page
    Then The user is redirected to the wrap page and "MATICx" is selected
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User opens the token selection screen
    And "RIC" does not have a wrap button next to the balance
    And User selects "RIC" from the super token list
    Then Token balance is shown correctly in the send stream page without a wrap button next to it

  Scenario: Searching for a token in the token selection screen
    Given "Send Page" is open with "staticBalanceAccount" connected on "polygon"
    And User opens the token selection screen
    And User searches for "MATIC" in the select token search field
    Then The "MATIC" is only shown as a token search result
    And User clears the token search field
    And User searches for "matic" in the select token search field
    Then The "MATIC" is only shown as a token search result
    And User clears the token search field
    And User searches for "YOLO420" in the select token search field
    Then The could not find any tokens message is shown

  Scenario: View mode warnings in send page
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "ongoingStreamAccount"
    And User clicks on the "send" navigation button
    And User fills all stream inputs "without" a wallet connected
    And User accepts the risk warning
    Then The stop viewing as an address button is visible

  Scenario: Wrong network warnings in the send page
    Given Dashboard is open with a mocked connection to "ongoingStreamAccount" on "polygon"
    And User connects their wallet to the dashboard
    And User changes their network to "gnosis"
    And User clicks on the "send" navigation button
    And User fills all stream inputs "with" a wallet connected
    And User accepts the risk warning
    And Change network button is visible with a message asking user to switch to "gnosis"

   Scenario: Ethereum mainnet uses minimum deposit instead of 4 hours of flow
     Given Transactional account john is connected to the dashboard on ethereum
     And User clicks on the "send" navigation button
     And User fills all stream inputs "with" a wallet connected
     Then The start stream button is disabled
     And The preview buffer amount shown and warning sections shows 69 tokens are needed for the buffer

  @skip @MikkSaidHeWillTakeAlook
  Scenario: Tokens getting sorted by amount in the token selection screen
    Given "Dashboard Page" is open without connecting a wallet
    And User uses view mode to look at "accountWithLotsOfData"
    And User clicks on the "send" navigation button
    And Send page is open and the send container is visible
    And User opens the token selection screen
    And User waits for token balances to load
    And User closes the dialog
    And User opens the token selection screen
    Then The tokens are sorted by amount in the token selection screen

  Scenario: Scheduled streams - End date has to be after start date
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "fTUSDx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the scheduling toggle
    And User inputs a date "1" "year" into the future into the stream start date
    And User inputs a date "1" "month" into the future into the stream end date
    Then The end date container outline is red
    Then The start date container outline is red
    And The start stream button is disabled

  Scenario: Scheduled streams - Start date has to be at least 15 minutes in the future
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "fTUSDx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the scheduling toggle
    And User inputs a date "10" "minute" into the future into the stream start date
    Then The start date container outline is red
    And The start stream button is disabled

  Scenario: Scheduled streams - End date has to be at least 15 minutes in the future
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "fTUSDx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the scheduling toggle
    And User inputs a date "10" "minute" into the future into the stream end date
    Then The end date container outline is red
    And The start stream button is disabled

  Scenario: Scheduled streams - Total stream amount getting correctly calculated with end and start date
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "fTUSDx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the scheduling toggle
    And User inputs a date "1" "month" into the future into the stream start date
    And User inputs a date "2" "month" into the future into the stream end date
    Then The total stream amount is correctly calculated to be "1"

  Scenario: Scheduled streams - Total stream amount getting correctly calculated with just end date
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "fTUSDx" per "month" to "0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    And User clicks the scheduling toggle
    And User inputs a date "1" "month" into the future into the stream end date
    Then The total stream amount is correctly calculated to be "1"

  Scenario: Scheduled streams - Allowlist message
    Given "Send Page" is open with "alice" connected on "polygon"
    And User clicks the scheduling toggle
    Then Allowlist message is shown

  Scenario: Scheduled streams - Allowlist not needed on goerli
    Given "Send Page" is open with "alice" connected on "goerli"
    And User clicks the scheduling toggle
    Then Scheduled stream fields are visible

  Scenario: Stream tables - stream with just start date
    Given "Dashboard Page" is open with "john" connected on "goerli"
    And User clicks on "goerli" "TDLx" row
    Then The stream row to "0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B" has a flow rate of "-1.0139" and dates to "1 Jan. 2025 10:00"
    And User clicks on "goerli" "TDLx" row
    And User opens "goerli" "TDLx" individual token page
    Then The stream row to "0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B" has a flow rate of "-1.0139" and dates to "1 Jan. 2025 10:00"

  Scenario: Stream tables - stream with start and end date
    Given "Dashboard Page" is open with "john" connected on "goerli"
    And User clicks on "goerli" "TDLx" row
    Then The stream row to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4" has a flow rate of "-1.0139" and dates to "31 Dec. 2024 22:0030 Jan. 2025 22:00"
    And User clicks on "goerli" "TDLx" row
    And User opens "goerli" "TDLx" individual token page
    Then The stream row to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4" has a flow rate of "-1.0139" and dates to "31 Dec. 2024 22:0030 Jan. 2025 22:00"

  Scenario: Stream tables - stream with end date
    Given "Dashboard Page" is open with "john" connected on "goerli"
    And User clicks on "goerli" "TDLx" row
    Then The stream row to "0x9B6157d44134b21D934468B8bf709294cB298aa7" has a flow rate of "-1.0139" and dates to "21 Mar. 2023 08:3430 Jan. 2025 22:00"
    And User clicks on "goerli" "TDLx" row
    And User opens "goerli" "TDLx" individual token page
    Then The stream row to "0x9B6157d44134b21D934468B8bf709294cB298aa7" has a flow rate of "-1.0139" and dates to "21 Mar. 2023 08:3430 Jan. 2025 22:00"

  Scenario: Modifying a streams start date
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "2" "TDLx" per "month" to "0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B"
    And User inputs a date "1" "year" into the future into the stream start date
    And User accepts the risk warning
    And User clicks the send transaction button
    And Scheduled stream transaction dialogs are shown
    And Transaction rejected error is shown

  Scenario: Modifying a stream with just end date
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "TDLx" per "month" to "0x9B6157d44134b21D934468B8bf709294cB298aa7"
    And Stream start date field is disabled
    And User inputs a date "2" "year" into the future into the stream end date
    And User accepts the risk warning
    And User clicks the send transaction button
    And Scheduled stream transaction dialogs are shown
    And Transaction rejected error is shown

  Scenario: Modifying a stream with start and end date ( not started yet )
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "TDLx" per "month" to "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4"
    And User inputs a date "1" "year" into the future into the stream start date
    And User inputs a date "2" "year" into the future into the stream end date
    And User accepts the risk warning
    And User clicks the send transaction button
    And Scheduled stream transaction dialogs are shown
    And Transaction rejected error is shown

  Scenario: Cancelling a scheduled stream - just end date
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "TDLx" per "month" to "0x9B6157d44134b21D934468B8bf709294cB298aa7"
    And User tries to cancel the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Cancelling a scheduled stream - just start date
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "TDLx" per "month" to "0x66693Ff26e2036FDf3a5EA6B7FDf853Ca1Adaf4B"
    And User tries to cancel the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Cancelling a scheduled stream - start and end date ( Not started )
    Given HDWallet transactions are rejected
    Given "Send Page" is open with "john" connected on "goerli"
    And User inputs all the details to send "1" "TDLx" per "month" to "0x9B6157d44134b21D934468B8bf709294cB298aa7"
    And User tries to cancel the stream and the first transaction dialogs are visible on "goerli"
    And Transaction rejected error is shown

  Scenario: Stream details are automatically input for ongoing streams
    Given "Send Page" is open with "john" connected on "goerli"
    And User searches for "0x1F26b0b62F4Eeee9C5E30893401dCe10B03D49A4" as a receiver
    And User opens the token selection screen
    And User selects "TDLx" from the super token list
    Then The flow rate field in the send page is "12.17"
    And The stream start date is set to "12/31/2024 22:00"
    And The stream end date is set to "01/30/2025 22:00"

  #TODO: Test cases that are broken/will get changed or no functionality yet
  #Scenario: Stream details page for a stream with just start date
  #Scenario: Stream details page for a stream with start and end date ( Not started yet )
  #Scenario: Searching for a recent receiver
  #Not working atm, create test case when fixed
  #Scenario: Changing time units in the send page
  #Rounding is kind of off atm, and there is no rounding solution for now,
  #There is a test case to check the previews, but will create the case with changing time units when it works precisely
