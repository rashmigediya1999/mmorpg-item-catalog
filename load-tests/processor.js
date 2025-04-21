export function generateUser(context, events, done) {
    const random = Math.floor(Math.random() * 100000);
    context.vars.username = `user${random}`;
    context.vars.email = `user${random}@example.com`;
    context.vars.password = "P@ssw0rd!";
    return done();
  }