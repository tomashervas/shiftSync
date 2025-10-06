# **App Name**: ShiftSync

## Core Features:

- Initial Shift Configuration: Users define shift types (Morning, Afternoon, etc.) and their corresponding durations. Predefined defaults provided. User defined hours for each shift.
- Calendar View: Display a monthly calendar (Sun-Sat) where each day can be assigned a shift type. Correct day-of-week alignment.
- Shift Assignment: Clicking on a day reveals buttons for each defined shift type, assigning that shift to the selected day.
- Hour Tracking: Calculate and display total hours worked for the month in the upper right of the UI.
- Month Navigation: Allow users to select and view different months.
- Data Persistence: Store shift assignments automatically in a Postgres database using Prisma with a connection string
- Authentication: Implement OAuth via Google Account.

## Style Guidelines:

- Background color: Desaturated blue-gray (#283149) for a professional and calming feel in dark mode.
- Primary color: Deep blue (#558BBD), offering a modern and trustworthy feel that evokes confidence.
- Accent color: Muted lavender (#B0B8D6), which, while remaining analogous to the primary color, provides a gentle highlight without causing distraction.
- Body font: 'PT Sans', sans-serif. Headline font: 'Playfair', serif. 'Playfair' gives an elegant feel, paired with 'PT Sans' for the body of the text which gives a modern feel.
- Use clear, professional icons for shift types. Emphasize clarity and easy recognition.
- Calendar view with clear separation of days and weeks. Display total hours prominently.
- Subtle transitions when assigning shifts and navigating months. Support for both dark and light modes. User preference stored in local storage.
