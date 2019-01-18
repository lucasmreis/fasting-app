import { Machine } from "xstate";

const lightMachine = Machine({
  id: "fastingScreen",
  initial: "notFasting",
  states: {
    notFasting: {
      on: { START_FAST: "fasting" }
    },
    fasting: {
      onEntry: ["saveStartTime"],
      onExit: ["saveEndTime"],
      on: { END_FAST: "congratulations" },
      initial: "visible",
      states: {
        checkVisible: {
          on: {
            "": [
              {
                target: "visible",
                cond: c => c.isVisible
              },
              {
                target: "notVisible",
                cond: c => !c.isVisible
              }
            ]
          }
        },
        visible: {
          onEntry: ["startTimer"],
          onExit: ["stopTimer"],
          on: {
            CHANGE_VISIBILITY: "notVisible"
          }
        },
        notVisible: {
          on: {
            CHANGE_VISIBILITY: "visible"
          }
        }
      }
    },
    congratulations: {
      on: {
        ACK: "notFasting"
      }
    }
  }
});
