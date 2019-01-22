import { Machine, actions } from "xstate";

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const fastingMachine = Machine(
  {
    id: "fastingScreen",
    initial: "isFasting",
    context: {
      startTime: null,
      isVisibleAtStart: true
    },
    states: {
      isFasting: {
        on: {
          "": [
            { target: "notFasting", cond: () => true },
            { target: "fasting", cond: () => false }
          ]
        }
      },
      notFasting: {
        on: {
          START_FAST: {
            target: "fasting",
            actions: ["saveStartTime"]
          }
        }
      },
      fasting: {
        onEntry: ["checkVisibility"],
        onExit: ["saveFast", "cleanStartTime"],
        on: { END_FAST: "congratulations" },
        initial: "checkVisible",
        states: {
          checkVisible: {
            on: {
              "": [
                {
                  target: "visible",
                  cond: c => c.isVisibleAtStart
                },
                {
                  target: "notVisible",
                  cond: c => !c.isVisibleAtStart
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
      checkVisibility: actions.assign({
        isVisibleAtStart: () => !document.hidden
      }),
      saveStartTime: actions.assign({ startTime: () => new Date() }),
      saveFast: function(ctx) {
        console.log(
          "Fasting saved! Started at " +
            ctx.startTime +
            " and finished at " +
            new Date()
        );
      },
      cleanStartTime: actions.assign({ startTime: null })
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
