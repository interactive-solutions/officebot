module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: 'airbnb-base',
  rules: {
    'max-len': [1, 100, 4], // Because 100 is better than 80
    'no-console': 0, // ...
    'no-underscore-dangle': 0, // Using 'private' functions
    'no-shadow': [2, { allow: ['resolve', 'reject', 'reply', 'err'] }], // Annoying when having nested redis calls
    'no-plusplus': 0, // += is awkward, ++ is love
    'consistent-return': 0, // Makes lodash iterators harder to read
    'no-param-reassign': 1, // Just warn
    'no-use-before-define': 0, // For better structure in files
  },
};
