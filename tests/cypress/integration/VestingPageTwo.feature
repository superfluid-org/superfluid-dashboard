@numTestsKeptInMemory(0)
Feature: Vesting page second batch of test cases

    @mocked
    Scenario Outline: Vesting schedule statuses - <status>
        Given Vesting schedule status is mocked to <status>

        Given Transactional account john is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        Then The first vesting row in the table shows <status>

        Examples:
            | status         |
            | Transfer Error |
            | Overflow Error |
            | Vested         |
            | Cliff          |
            | Vesting        |
            | Deleted        |
            | Stream Error   |
            | Cancel Error   |
            | Scheduled      |

    @mocked
    Scenario Outline: Schedule progress bar showing correctly for a scheduled vesting
        Given Vesting schedule progress is mocked to <state>

        Given Transactional account john is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        And User opens the last vesting schedule they have created
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
        And User clicks on the "vesting" navigation button
        And "StIbAlluoUSD" permissions icons are all "green"
        And User opens "StIbAlluoUSD" permission table row
        Then All current and recommended permissions are correctly showed for "StIbAlluoUSD"

    Scenario: Vesting schedule allowlist message - Try out on Mumbai testnet button
        Given Transactional account alice is connected to the dashboard on polygon
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        Then Vesting allowlist message is shown
        And User tries out vesting on Mumbai testnet
        And User inputs "3" as the total vested amount
        And User inputs "4" "year" as the total vesting period

    Scenario: Vesting schedule allowlist message for a user who is not allowlisted
        Given Transactional account alice is connected to the dashboard on polygon
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        Then Vesting allowlist message is shown

    Scenario: Setting up auto-wrap from the vesting form (rejected)
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on polygon-mumbai
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
        And Auto-wrap transaction message is shown for "fDAIx" on "polygon-mumbai"
        Then Transaction rejected error is shown

    Scenario: Auto-Wrap not available for native tokens in the vesting form
        And Transactional account john is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        And User selects "ETHx" as the super token to use for the stream
        #The UI showing the Enable auto-wrap switch is not instant, waiting just to be sure it is not getting shown
        And User waits for 5 seconds
        Then Auto-wrap switch does not exist

    Scenario: Auto-Wrap not available for pure tokens in the vesting form
        And Transactional account john is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        And User selects "NTDL" as the super token to use for the stream
        #The UI showing the Enable auto-wrap switch is not instant, waiting just to be sure it is not getting shown
        And User waits for 5 seconds
        Then Auto-wrap switch does not exist

    Scenario: Top up warning not shown if auto-wrap switch is enabled
        And Transactional account john is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        And User selects "FUNDx" as the super token to use for the stream
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

    Scenario: Auto-wrap available to everyone on polygon-mumbai
        And Transactional account bob is connected to the dashboard on polygon-mumbai
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        And User selects "TDLx" as the super token to use for the stream
        Then Auto-wrap switch is visible

    Scenario: Auto-wrap available to allowlisted addresses on mainnet
        And Transactional account john is connected to the dashboard on polygon
        And User clicks on the "vesting" navigation button
        And User clicks on the create vesting schedule button
        And User selects "USDCx" as the super token to use for the stream

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
        And Transactional account john is connected to the dashboard on polygon-mumbai
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
        And Auto-wrap allowance transaction message is shown on "polygon-mumbai"
        Then Transaction rejected error is shown

    Scenario: Auto-wrap switch not showing up for a user who already has auto-wrap set up
        Given HDWallet transactions are rejected
        And Transactional account john is connected to the dashboard on polygon-mumbai
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
        And User opens "MATICx" permission table row
        Then Auto-wrap icon for "MATICx" is "not existing"

    Scenario: Permissions table - Change network button - enabling auto-wrap
        Given Dashboard is open with a mocked connection to "john" on "polygon-mumbai"
        And User connects their wallet to the dashboard
        And User clicks on the "vesting" navigation button
        And User changes their network to "polygon-mumbai"
        Then User opens "fTUSDx" permission table row
        Then Enable auto-wrap button is not visible
        And Switch network button is visible in the "fTUSDx" permission row

    Scenario: Permissions table - Change network button - disabling auto-wrap
        Given Dashboard is open with a mocked connection to "john" on "polygon-mumbai"
        And User connects their wallet to the dashboard
        And User clicks on the "vesting" navigation button
        And User changes their network to "polygon-mumbai"
        Then User opens "fUSDCx" permission table row
        Then Disable auto-wrap button does not exist
        And Switch network button is visible in the "fUSDCx" permission row

    Scenario: Permissions table - Change network button - Fixing vesting permissions
        Given Dashboard is open with a mocked connection to "john" on "polygon-mumbai"
        And User connects their wallet to the dashboard
        And User clicks on the "vesting" navigation button
        And User changes their network to "polygon-mumbai"
        Then User opens "fUSDCx" permission table row
        Then Fix permissions button does not exist
        And Switch network button is shown instead of fix permissions button

    Scenario: Permissions table - Stop viewing button - enabling auto-wrap
        Given "Dashboard page" is open using view mode to look at "john"
        And User changes their network to "polygon-mumbai"
        And User clicks on the "vesting" navigation button
        Then User opens "fTUSDx" permission table row
        Then Enable auto-wrap button is not visible
        And Stop viewing button is visible in the "fTUSDx" permission row
        And User clicks on the stop viewing as an address button
        Then Vesting page while a wallet is not connected screen is shown

    Scenario: Permissions table - Stop viewing button - disabling auto-wrap
        Given "Dashboard page" is open using view mode to look at "john"
        And User changes their network to "polygon-mumbai"
        And User clicks on the "vesting" navigation button
        Then User opens "fTUSDx" permission table row
        Then Disable auto-wrap button does not exist
        And Stop viewing button is visible in the "fTUSDx" permission row
        And User clicks on the stop viewing as an address button
        Then Vesting page while a wallet is not connected screen is shown

    Scenario: Invalid vesting page leading to a 404 page
        Given "404 Vesting Page" is open without connecting a wallet
        Then 404 page is shown
