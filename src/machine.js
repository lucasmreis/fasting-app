import { Machine, actions } from "xstate";

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const fastingMachine = Machine(
  {
    id: "fastingScreen",
    initial: "notFasting",
    context: { startTime: null },
    states: {
      notFasting: {
        on: { START_FAST: "fasting" }
      },
      fasting: {
        onEntry: ["saveStartTime"],
        onExit: ["saveFast"],
        activities: ["visibility"],
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
            activities: ["timer"],
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
  },
  {
    actions: {
      saveStartTime: actions.assign({ startTime: new Date() }),
      saveFast: function(ctx) {
        console.log(
          "Fasting saved! Started at " +
            ctx.startTime +
            " and finished at " +
            new Date()
        );
      }
    },
    activities: {
      timer: function(ctx) {
        const t = setInterval(
          () => console.log(new Date() - ctx.startTime),
          1000
        );
        return () => clearInterval(t);
      }
    }
  }
);
