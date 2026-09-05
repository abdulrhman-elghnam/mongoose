function longestCommonPre(str) {
  let pre = str[0];
  for (let i = 1; i < str.length; i++) {
    while (!str[i].startsWith(pre)) {
      pre = pre.slice(0, -1);

      if (pre === "") {
        return "";
      }
    }
  }
  return pre;
}