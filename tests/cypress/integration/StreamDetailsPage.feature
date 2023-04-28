Feature: Stream details page test cases

    Scenario: Stream details page for an ongoing stream
        Given "Ongoing stream details page" is open without connecting a wallet
        Then The token icon has got an animation around it
        And The streamed amount is flowing
        And Ongoing stream data is shown correctly

    Scenario: Stream details page for an ended stream
        Given "Ended stream details page" is open without connecting a wallet
        And The token icon has got an animation around it
        And The streamed amount is not flowing
        Then Ended stream data is shown correctly
        And Cancelled stream message is visible

    Scenario: 404 page showing up for a stream that doesn't exist
        Given "Invalid stream details page" is open without connecting a wallet
        Then 404 page is shown

    Scenario: Stream details page back button
        Given "Ongoing stream details page" is open without connecting a wallet
        And User clicks on the back button
        And Dashboard page is open when wallet of the user is not connected
        And User uses view mode to look at "ongoingStreamAccount"
        And User waits for balances to load
        And User clicks on "polygon" "MATICx" row
        And User waits for 2 stream entries to be shown
        And User opens the first visible stream details page from the table
        And Ongoing stream data is shown correctly
        And View mode chip shows "0xEb85...c28d"
        And User clicks on the back button
        And Dashboard page is open when wallet of the user is connected or in view mode
        And User opens "polygon" "MATICx" individual token page
        And User opens the first visible stream details page from the table
        And Ongoing stream data is shown correctly

    #    Enable these steps once it gets fixed
    #    And User clicks on the back button
    #    Then Individual token page is open
    Scenario: Stream details page supporting v1 links
        Given "v1 Ended stream details page" is open without connecting a wallet
        Then Ended stream data is shown correctly

    Scenario: Stream details page hyperlinks
        Given "Ended stream details page" is open without connecting a wallet
        And The token icon has got an animation around it
        And Receiver and Sender copy button an hyperlink tooltips show up when user hovers on them
        And Receiver and Sender transaction hash buttons have the correct explorer link
        And The address gets copied when user clicks on the Receiver and Sender copy buttons
        And The stream transaction hash copy and explorer link tooltips show up
        And The transaction hash gets copied when user clicks on the copy button
        And The transaction hash hyperlink has got the correct explorer link
        And The stream copy button tooltips show up when user clicks on them
        And The social network tooltips show up and have the correct links

    Scenario: Scheduled stream showing correct details
        Given "Close-ended stream details page" is open without connecting a wallet
        Then The token icon has got an animation around it
        And The streamed amount is flowing
        And Close-ended stream data is shown correctly

    Scenario: Vesting stream details page
        Given "Vesting stream details page" is open without connecting a wallet
        Then The token icon has got an animation around it
        And The streamed amount is flowing
        And Vesting stream data is shown correctly


#TODO once a better solution for connecting the wallet is done or cancel button
#And Once wrap/unwrap buttons and liquidation info gets added to the page
#  Scenario: Stream details page wrap/unwrap buttons
#  Scenario: Stream details page cancel button
#  Scenario: Liquidated stream details page