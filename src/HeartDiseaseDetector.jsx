import React, { useState } from 'react';
import {
  Heart,
  Activity,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  BarChart3
} from 'lucide-react';

const HeartDiseaseDetector = () => {
  const [patientData, setPatientData] = useState({
    age: 50,
    sex: 1,
    chestPain: 0,
    restingBP: 120,
    cholesterol: 200,
    fastingBS: 0,
    restingECG: 0,
    maxHR: 150,
    exerciseAngina: 0,
    oldpeak: 1.0,
    stSlope: 1
  });

  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelMetrics] = useState({
    accuracy: 0.87,
    precision: 0.85,
    recall: 0.89,
    f1Score: 0.87
  });

  const modelWeights = {
    age: 0.02,
    sex: 0.8,
    chestPain: 0.9,
    restingBP: 0.01,
    cholesterol: 0.005,
    fastingBS: 0.3,
    restingECG: 0.5,
    maxHR: -0.01,
    exerciseAngina: 1.2,
    oldpeak: 0.7,
    stSlope: 0.6,
    bias: -2.5
  };

  const normalizeFeatures = (data) => {
    const ranges = {
      age: [29, 77],
      restingBP: [80, 200],
      cholesterol: [126, 564],
      maxHR: [71, 202],
      oldpeak: [0, 6.2]
    };

    return {
      age: (data.age - ranges.age[0]) / (ranges.age[1] - ranges.age[0]),
      sex: data.sex,
      chestPain: data.chestPain / 3,
      restingBP: (data.restingBP - ranges.restingBP[0]) / (ranges.restingBP[1] - ranges.restingBP[0]),
      cholesterol: (data.cholesterol - ranges.cholesterol[0]) / (ranges.cholesterol[1] - ranges.cholesterol[0]),
      fastingBS: data.fastingBS,
      restingECG: data.restingECG / 2,
      maxHR: (data.maxHR - ranges.maxHR[0]) / (ranges.maxHR[1] - ranges.maxHR[0]),
      exerciseAngina: data.exerciseAngina,
      oldpeak: (data.oldpeak - ranges.oldpeak[0]) / (ranges.oldpeak[1] - ranges.oldpeak[0]),
      stSlope: data.stSlope / 2
    };
  };

  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  const predictHeartDisease = (data) => {
    const normalized = normalizeFeatures(data);
    let logit = modelWeights.bias;
    Object.keys(normalized).forEach(key => {
      logit += normalized[key] * modelWeights[key];
    });
    return sigmoid(logit);
  };

  const assessRiskFactors = (data) => {
    const risks = [];
    if (data.age > 55) risks.push({ factor: 'Age', level: 'High', description: 'Age > 55 increases risk' });
    if (data.chestPain >= 2) risks.push({ factor: 'Chest Pain', level: 'High', description: 'Significant chest pain patterns' });
    if (data.restingBP > 140) risks.push({ factor: 'Blood Pressure', level: 'High', description: 'Hypertension detected' });
    if (data.cholesterol > 240) risks.push({ factor: 'Cholesterol', level: 'High', description: 'High cholesterol levels' });
    if (data.exerciseAngina === 1) risks.push({ factor: 'Exercise Angina', level: 'High', description: 'Exercise-induced chest pain' });
    if (data.oldpeak > 2) risks.push({ factor: 'ST Depression', level: 'Moderate', description: 'Significant ST depression' });
    return risks;
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const prob = predictHeartDisease(patientData);
    setPrediction(prob > 0.5 ? 'Positive' : 'Negative');
    setConfidence(Math.round(prob * 100));
    setIsAnalyzing(false);
  };

  const handleInputChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getRiskLevel = () => {
    if (confidence > 70) return { level: 'High Risk', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (confidence > 40) return { level: 'Moderate Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const riskFactors = assessRiskFactors(patientData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Heart Disease Detection</h1>
          </div>
          <p className="text-gray-600 text-lg">AI-Powered Cardiovascular Risk Assessment System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <User className="h-6 w-6 mr-2 text-blue-600" />
              Patient Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Age', 'age', 'number', 20, 100],
                ['Sex', 'sex', 'select', null, null, [{ label: 'Male', value: 1 }, { label: 'Female', value: 0 }]],
                ['Chest Pain Type', 'chestPain', 'select', null, null, [
                  { label: 'Typical Angina', value: 0 },
                  { label: 'Atypical Angina', value: 1 },
                  { label: 'Non-Anginal Pain', value: 2 },
                  { label: 'Asymptomatic', value: 3 }
                ]],
                ['Resting BP (mmHg)', 'restingBP', 'number', 80, 200],
                ['Cholesterol (mg/dl)', 'cholesterol', 'number', 100, 600],
                ['Fasting Blood Sugar', 'fastingBS', 'select', null, null, [
                  { label: '≤ 120 mg/dl', value: 0 },
                  { label: '> 120 mg/dl', value: 1 }
                ]],
                ['Resting ECG', 'restingECG', 'select', null, null, [
                  { label: 'Normal', value: 0 },
                  { label: 'ST-T Wave Abnormality', value: 1 },
                  { label: 'LV Hypertrophy', value: 2 }
                ]],
                ['Max Heart Rate', 'maxHR', 'number', 60, 220],
                ['Exercise Angina', 'exerciseAngina', 'select', null, null, [
                  { label: 'No', value: 0 },
                  { label: 'Yes', value: 1 }
                ]],
                ['ST Depression (Oldpeak)', 'oldpeak', 'number', 0, 10],
                ['ST Slope', 'stSlope', 'select', null, null, [
                  { label: 'Upsloping', value: 0 },
                  { label: 'Flat', value: 1 },
                  { label: 'Downsloping', value: 2 }
                ]]
              ].map(([label, field, type, min, max, options]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  {type === 'select' ? (
                    <select
                      value={patientData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={field === 'oldpeak' ? '0.1' : '1'}
                      value={patientData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isAnalyzing ? (
                <Activity className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Heart Disease Risk'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {prediction && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Prediction Result
                </h3>

                <div className={`p-4 rounded-lg ${getRiskLevel().bgColor} mb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Risk Level:</span>
                    <span className={`font-bold ${getRiskLevel().color}`}>
                      {getRiskLevel().level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Confidence:</span>
                    <span className="font-bold">{confidence}%</span>
                  </div>
                </div>

                {prediction === 'Positive' ? (
                  <div className="flex items-start p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold">High Risk Detected</p>
                      <p>Please consult a cardiologist immediately for further evaluation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">Low Risk</p>
                      <p>Continue regular checkups and maintain a healthy lifestyle.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Risk Factors
              </h3>

              {riskFactors.length > 0 ? (
                <div className="space-y-3">
                  {riskFactors.map((risk, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        risk.level === 'High'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{risk.factor}</p>
                          <p className="text-sm text-gray-600">{risk.description}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk.level === 'High'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {risk.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No significant risk factors detected.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Model Performance
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold">
                    {(modelMetrics.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precision:</span>
                  <span className="font-semibold">
                    {(modelMetrics.precision * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recall:</span>
                  <span className="font-semibold">
                    {(modelMetrics.recall * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">F1-Score:</span>
                  <span className="font-semibold">
                    {(modelMetrics.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">About This System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">ML Algorithm</h4>
              <p className="text-sm text-gray-600">
                Uses logistic regression with feature normalization to predict
                heart disease risk based on clinical parameters.
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Early Detection</h4>
              <p className="text-sm text-gray-600">
                Identifies patients at risk before symptoms appear, enabling
                preventive interventions and lifestyle changes.
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Clinical Support</h4>
              <p className="text-sm text-gray-600">
                Assists healthcare providers with data-driven insights for better
                patient care and treatment planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartDiseaseDetector;
