declare module 'sequelize' {
  class Model<T = any, T2 = any> {
    static hasMany: Function;
    static belongsTo: Function;
    static belongsToMany: Function;
    static hasOne: Function;
    static init: Function;
    associate?: (models: Model) => void;
  }
} 