import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  userName: "",
  role: "",
  departmentId: null,
  departmentName: '',
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      let { _id = "", userName = "", role = "", departmentId = null, departmentName = "" } = action.payload;
      state._id = _id;
      state.userName = userName;
      state.role = role
      state.departmentId = departmentId;
      state.departmentName = departmentName;
    },
    clearUser: (state) => {
      state._id = "";
      state.userName = "";
      state.role = "";
      state.departmentId = null;
      state.departmentName = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
