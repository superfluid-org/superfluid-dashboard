@numTestsKeptInMemory(0)
@retries(5)
Feature: Wrapping and Unwrapping transactional test cases

    Scenario: Wrapping network native tokens
        Given Transactional account dan is connected to the dashboard on avalanche-fuji
        And User clicks on the "wrap-unwrap" navigation button
        And User wraps the "0.1" of the selected token
        And Transaction dialog for avalanche-fuji is shown wrapping 0.1 MATIC
        And Wrap transaction broadcasted message is shown
        And User clicks on the go to tokens page button from tx dialog
        And The transaction drawer shows a pending "Wrap to Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And The transaction drawer shows a succeeded "Wrap to Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And Users super token balance of "MATICx" on "avalanche-fuji" increases by "0.1" in the dashboard page
        And User restores the last transaction
        Then Wrap field input field has "0.1" written in it
        And The token balances after wrapping "0.1" tokens are correctly shown in the wrap page

    Scenario: Unwrapping network native token
        Given Transactional account dan is connected to the dashboard on avalanche-fuji
        And User clicks on the "wrap-unwrap" navigation button
        And User switches to unwrap tab
        And User unwraps the "0.1" of the selected token
        And Transaction dialog for avalanche-fuji is shown unwrapping 0.1 MATIC
        And Transaction broadcasted message with ok button is shown
        And User clicks the OK button
        And User opens the transaction drawer
        And The transaction drawer shows a pending "Unwrap from Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And The transaction drawer shows a succeeded "Unwrap from Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And User clicks on the "dashboard" navigation button
        And Users super token balance of "MATICx" on "avalanche-fuji" decreases by "0.1" in the dashboard page
        And User restores the last transaction
        Then Unwrap field input field has "0.1" written in it
        And The token balances after wrapping "0.1" tokens are correctly shown in the unwrap page

    Scenario: Wrapping normal underlying tokens
        Given Transactional account dan is connected to the dashboard on avalanche-fuji
        And User clicks on the "wrap-unwrap" navigation button
        And User opens the token selection in the wrap page
        And User chooses "fUSDC" to wrap
        And User inputs "0.1" into the wrap field
        And User approves the protocol to use "0.1" "fUSDC" on "avalanche-fuji" if necessary
        And User wraps the "0.1" of the selected token
        And Transaction dialog for avalanche-fuji is shown wrapping 0.1 fUSDC
        And Wrap transaction broadcasted message is shown
        And User clicks on the go to tokens page button from tx dialog
        And The transaction drawer shows a pending "Wrap to Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And The transaction drawer shows a succeeded "Wrap to Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And Users super token balance of "fUSDCx" on "avalanche-fuji" increases by "0.1" in the dashboard page
        And User restores the last transaction
        Then Wrap field input field has "0.1" written in it
        And The token balances after wrapping "0.1" tokens are correctly shown in the wrap page

    Scenario: Unwrapping normal super tokens
        Given Transactional account dan is connected to the dashboard on avalanche-fuji
        And User clicks on the "wrap-unwrap" navigation button
        And User switches to unwrap tab
        And User opens the token selection in the wrap page
        And User chooses "fUSDCx" to wrap
        And User unwraps the "0.1" of the selected token
        And Transaction dialog for avalanche-fuji is shown unwrapping 0.1 fUSDC
        And Transaction broadcasted message with ok button is shown
        And User clicks the OK button
        And User opens the transaction drawer
        And The transaction drawer shows a pending "Unwrap from Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And The transaction drawer shows a succeeded "Unwrap from Super Token" transaction on "avalanche-fuji"
        And The restore button is visible for the last transaction
        And User clicks on the "dashboard" navigation button
        And Users super token balance of "fUSDCx" on "avalanche-fuji" decreases by "0.1" in the dashboard page
        And User restores the last transaction
        Then Unwrap field input field has "0.1" written in it
        And The token balances after wrapping "0.1" tokens are correctly shown in the unwrap page
