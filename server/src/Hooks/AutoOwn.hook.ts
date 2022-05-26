export default (context) => {
  context.data.UserId = context.params.User.id;
  return context;
};
