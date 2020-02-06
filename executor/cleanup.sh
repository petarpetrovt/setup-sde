#!/bin/bash
#author Bret Comnes -> https://github.com/GabrielBB/xvfb-action/blob/master/cleanup.sh

kill_xvfb () {
    local xvfb_pids=`ps aux | grep tmp/xvfb-run | grep -v grep | awk '{print $2}'`
    if [ "$xvfb_pids" != "" ]; then
        echo "Killing the following xvfb processes: $xvfb_pids"
        sudo kill $xvfb_pids
    else
        echo "No xvfb processes to kill"
    fi
}

kill_xvfb