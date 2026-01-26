
import { format } from 'date-fns';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const dateStr = format(tomorrow, 'yyyy-MM-dd');
const goalStartDate = dateStr; // Start tomorrow

const result = dateStr < goalStartDate;
console.log(`'${dateStr}' < '${goalStartDate}' is ${result}`); // Should be false.

if (dateStr < goalStartDate) {
    console.log("Hidden (Too early)");
} else {
    console.log("Visible (On time)");
}
