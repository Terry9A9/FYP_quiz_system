
export type quiz = {
    title: string
    quiz_id: string,
    created_by: string,
    course: string,
    start_date: string,
    end_date: string,
    time: number,
    random: boolean,
    question_set: question[]
}

export type question = {
    point: number,
    question: string,
    type:
        "Mc"
        | "TrueOrFalse"
        | "FillInTheBlank"
        | "Sorting"
        | "Picture"
        | "Drawing",
    img?: string,
    answers: string[],
    correct: number
}

export type profile = {
    socketId:string,
    totalPoint: number
}

const msalConfig = {
    auth: {
      clientId: 'a0c66418-c902-439e-8bdb-1b35ed3b261d',
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: 'http://localhost:5173/auth/redirect',
    },
      cache: {
        cacheLocation: "sessionStorage" as 'localstorage',
        storeAuthStateInCookie: true,
      },
      system: {
        loggerOptions: {
          loggerCallback: (
            level: LogLevel,
            message: string,
            containsPii: boolean
          ): void => {
            if (containsPii) {
              return;
            }
            switch (level) {
              case LogLevel.Error:
                console.error(message);
                return;
              case LogLevel.Info:
                console.info(message);
                return;
              case LogLevel.Verbose:
                console.debug(message);
                return;
              case LogLevel.Warning:
                console.warn(message);
                return;
            }
          },
          piiLoggingEnabled: false,
          logLevel: "Info",
        },
      },
    };

import { UserAgentApplication } from 'msal';
export const msalInstance = new UserAgentApplication(msalConfig);



