import { Markup } from 'telegraf';
// import { ExpensesCategoriesEnum } from '../enums/expenses-categories.enum';
// import { IncomeCategoriesEnum } from '../enums/income-categories.enum';

// export const actionButtons = () => {
//   return Markup.keyboard(
//     [Markup.button.text('Транзакції'), Markup.button.text('Статистика')],
//     { columns: 2 },
//   );
// };
//
// export const expensesButtons = () => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback('Затранжирив 😿', 'expenses'),
//       Markup.button.callback('Заробив 💸', 'income'),
//       Markup.button.callback('Нє, всьо покашо', 'cancel'),
//     ],
//     { columns: 3 },
//   );
// };
//
// export const expensesCategoriesButtons = () => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback('Їжа 🍔', ExpensesCategoriesEnum.FOOD),
//       Markup.button.callback('Транспорт 🚕', ExpensesCategoriesEnum.TRANSPORT),
//       Markup.button.callback(
//         'Розваги 🎉',
//         ExpensesCategoriesEnum.ENTERTAINMENT,
//       ),
//       Markup.button.callback('Дім 🏠', ExpensesCategoriesEnum.HOME),
//       Markup.button.callback('Одяг 👕', ExpensesCategoriesEnum.CLOTHES),
//       Markup.button.callback('Діти 👶', ExpensesCategoriesEnum.CHILDREN),
//       Markup.button.callback("Здоров'я 🏥", ExpensesCategoriesEnum.HEALTH),
//       Markup.button.callback('Машина 🚗', ExpensesCategoriesEnum.CAR),
//       Markup.button.callback('Інше 🤷‍♂️', ExpensesCategoriesEnum.OTHER),
//       Markup.button.callback(
//         'Підписки 🎧',
//         ExpensesCategoriesEnum.SUBSCRIPTIONS,
//       ),
//     ],
//     { columns: 3 },
//   );
// };
//
// export const incomeCategoriesButtons = () => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback('Зарплата 💰', IncomeCategoriesEnum.SALARY),
//       Markup.button.callback('Подарунок 🎁', IncomeCategoriesEnum.GIFTS),
//       Markup.button.callback('Борг', IncomeCategoriesEnum.LOANS),
//       Markup.button.callback('Інвестиції 📈', IncomeCategoriesEnum.INVESTMENTS),
//       Markup.button.callback('Депозити 🏦', IncomeCategoriesEnum.DEPOSITS),
//       Markup.button.callback('Інше 🤷‍♂️', IncomeCategoriesEnum.OTHER),
//     ],
//     { columns: 3 },
//   );
// };
//
// export const statisticsButtons = () => {
//   return Markup.inlineKeyboard(
//     [
//       Markup.button.callback('За місяць 📅', 'month'),
//       Markup.button.callback('За тиждень 📆', 'week'),
//       Markup.button.callback('За день 📆', 'day'),
//     ],
//     { columns: 3 },
//   );
// };
