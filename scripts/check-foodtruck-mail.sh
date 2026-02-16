#!/bin/bash
# Check FoodTrucks mailbox for unread messages
# Returns email details if found

osascript << 'EOF'
tell application "Mail"
    try
        set ftBox to mailbox "FoodTrucks"
        set unreadMsgs to (messages of ftBox whose read status is false)
        set msgCount to count of unreadMsgs
        
        if msgCount = 0 then
            return "NO_NEW_EMAILS"
        end if
        
        set output to "FOUND:" & msgCount & linefeed
        
        repeat with msg in unreadMsgs
            set output to output & "===EMAIL===" & linefeed
            set output to output & "ID:" & (id of msg) & linefeed
            set output to output & "FROM:" & (sender of msg) & linefeed
            set output to output & "SUBJECT:" & (subject of msg) & linefeed
            set output to output & "DATE:" & (date received of msg) & linefeed
            set output to output & "BODY:" & linefeed
            set output to output & (content of msg) & linefeed
            set output to output & "===END===" & linefeed
        end repeat
        
        return output
    on error errMsg
        return "ERROR:" & errMsg
    end try
end tell
EOF
