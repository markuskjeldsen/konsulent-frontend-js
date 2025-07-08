<template>
  <h3>create user</h3>
  <p>her kan man lave nye brugere</p>
  <br />
  <form>
    <div>
      <label> username: </label>
      <input type="text" />
      <label> bruges til at logge ind med </label>
    </div>
    <div>
      <label> Fulde navn: </label>
      <input type="text" />
      <label> Navnet som vil blive vist om konsulenten</label>
    </div>
    <div>
      <label for="rights">Rettigheder: </label>
      <select id="rights" name="rights">
        <option value="user">Konsulent</option>
        <option value="admin">Admin</option>
        <option value="developer">Dev</option>
      </select>
      <label> bestemmer hvad brugeren kan gøre </label>
    </div>
  </form>
</template>

<script setup></script>
