import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    age: 65,
    gender: "M",
    admission_type: "URGENT",
    myocardial_infarction: 1,
    heart_failure: 0,
    cardiac_arrest: 0,
    chronic_ischemic_hd: 1,
    los: 5
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const predict = async () => {
    const res = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        age: Number(form.age),
        los: Number(form.los),
        myocardial_infarction: Number(form.myocardial_infarction),
        heart_failure: Number(form.heart_failure),
        cardiac_arrest: Number(form.cardiac_arrest),
        chronic_ischemic_hd: Number(form.chronic_ischemic_hd)
      })
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>💙 Mortality Risk Predictor</h1>

      <input name="age" placeholder="Age" onChange={handleChange} /><br /><br />

      <select name="gender" onChange={handleChange}>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select><br /><br />

      <select name="admission_type" onChange={handleChange}>
        <option value="URGENT">Urgent</option>
        <option value="EMERGENCY">Emergency</option>
        <option value="ELECTIVE">Elective</option>
      </select><br /><br />

      <input name="los" placeholder="Length of stay" onChange={handleChange} /><br /><br />

      <input name="myocardial_infarction" placeholder="MI (0/1)" onChange={handleChange} /><br /><br />
      <input name="heart_failure" placeholder="Heart Failure (0/1)" onChange={handleChange} /><br /><br />
      <input name="cardiac_arrest" placeholder="Cardiac Arrest (0/1)" onChange={handleChange} /><br /><br />
      <input name="chronic_ischemic_hd" placeholder="Chronic Ischemic HD (0/1)" onChange={handleChange} /><br /><br />

      <button onClick={predict}>Predict</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Result:</h2>
          <p><b>Prediction:</b> {result.prediction}</p>
          <p><b>Probability:</b> {result.probability}</p>
        </div>
      )}
    </div>
  );
}
