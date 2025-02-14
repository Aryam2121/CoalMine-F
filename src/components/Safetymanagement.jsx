import React, { useState, useEffect, useReducer, useCallback } from 'react';
import axios from '../services/axios';
import { useDropzone } from 'react-dropzone';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'react-datepicker/dist/react-datepicker.css';
import { Editor } from '@tinymce/tinymce-react';
import { CircularProgress } from '@mui/material';

const initialState = {
  smpData: [{ riskAssessment: '', controlMeasures: '', riskLevel: '', priority: '', progress: 0 }],
  file: null,
  filePreview: null,
  successMessage: '',
  errorMessage: '',
  isDraftSaved: false,
  loading: false,
};

const smpReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SMP_DATA':
      return { ...state, smpData: action.payload };
    case 'SET_FILE':
      return { ...state, file: action.payload, filePreview: URL.createObjectURL(action.payload) };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload, errorMessage: '' };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.payload, successMessage: '' };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DRAFT_SAVED':
      return { ...state, isDraftSaved: action.payload };
    default:
      return state;
  }
};

const SafetyManagementPlan = () => {
  const [state, dispatch] = useReducer(smpReducer, initialState);

  const handleInputChange = (index, e) => {
    const newSmpData = [...state.smpData];
    newSmpData[index][e.target.name] = e.target.value;
    dispatch({ type: 'SET_SMP_DATA', payload: newSmpData });
  };

  const handleFileChange = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5000000) {
        dispatch({ type: 'SET_ERROR', payload: 'File size exceeds 5MB' });
        return;
      }
      dispatch({ type: 'SET_FILE', payload: file });
    }
  };

  const addMoreFields = () => {
    dispatch({ type: 'SET_SMP_DATA', payload: [...state.smpData, { riskAssessment: '', controlMeasures: '', riskLevel: '', priority: '', progress: 0 }] });
  };

  const removeFields = (index) => {
    if (window.confirm('Are you sure you want to remove this field?')) {
      const newSmpData = state.smpData.filter((_, i) => i !== index);
      dispatch({ type: 'SET_SMP_DATA', payload: newSmpData });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*,application/pdf',
    onDrop: handleFileChange,
  });

  const handleProgressChange = (index, value) => {
    const newSmpData = [...state.smpData];
    newSmpData[index].progress = value;
    dispatch({ type: 'SET_SMP_DATA', payload: newSmpData });
  };

  const validateForm = () => {
    return state.smpData.every(item => item.riskAssessment && item.controlMeasures && item.riskLevel && item.priority);
  };

  const submitSMP = async () => {
    if (!validateForm()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please fill out all required fields.' });
      return;
    }

    const formData = new FormData();
    formData.append('smpData', JSON.stringify(state.smpData));
    if (state.file) {
      formData.append('file', state.file);
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await axios.post('/safety-plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch({ type: 'SET_SUCCESS', payload: 'Safety Management Plan submitted successfully!' });
      dispatch({ type: 'SET_DRAFT_SAVED', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error submitting Safety Management Plan. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveDraft = () => {
    localStorage.setItem('smpDraft', JSON.stringify(state.smpData));
    dispatch({ type: 'SET_DRAFT_SAVED', payload: true });
  };

  const loadDraft = useCallback(() => {
    const draft = localStorage.getItem('smpDraft');
    if (draft) {
      dispatch({ type: 'SET_SMP_DATA', payload: JSON.parse(draft) });
      dispatch({ type: 'SET_DRAFT_SAVED', payload: true });
    }
  }, []);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  return (
    <div className="p-8 bg-gray-900 rounded-lg shadow-lg w-full min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-6 text-blue-600">Safety Management Plan</h2>

      {state.successMessage && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{state.successMessage}</div>}
      {state.errorMessage && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{state.errorMessage}</div>}
      {state.isDraftSaved && <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">Draft saved successfully!</div>}

      <form onSubmit={(e) => { e.preventDefault(); submitSMP(); }}>

        {state.smpData.map((item, index) => (
          <div key={index} className="mb-6 p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
            <h3 className="text-2xl font-semibold mb-4 text-white">Risk Assessment #{index + 1}</h3>

            <Editor
              apiKey="y85cli9lxbiruvszifm8p7ba3fflegj7wfu377wdbpt3f7rg"
              value={item.riskAssessment}
              init={{ height: 150 }}
              onEditorChange={(content) => handleInputChange(index, { target: { name: 'riskAssessment', value: content } })}
              className="mb-4"
            />

            <Editor
              apiKey="y85cli9lxbiruvszifm8p7ba3fflegj7wfu377wdbpt3f7rg"
              value={item.controlMeasures}
              init={{ height: 150 }}
              onEditorChange={(content) => handleInputChange(index, { target: { name: 'controlMeasures', value: content } })}
              className="mb-4"
            />

            <label className="block text-lg font-medium text-white mb-2">Risk Level</label>
            <select
              name="riskLevel"
              value={item.riskLevel}
              onChange={(e) => handleInputChange(index, e)}
              className="block w-full p-3 border rounded-lg mb-4 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Risk Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <label className="block text-lg font-medium text-white mb-2">Priority</label>
            <select
              name="priority"
              value={item.priority}
              onChange={(e) => handleInputChange(index, e)}
              className="block w-full p-3 border rounded-lg mb-4 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <label className="block text-lg font-medium text-white mb-2">Progress</label>
            <ProgressBar now={item.progress} label={`${item.progress}%`} className="mb-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={item.progress}
              onChange={(e) => handleProgressChange(index, e.target.value)}
              className="w-full mb-4 focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => removeFields(index)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addMoreFields}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-4 hover:bg-blue-600 transition-colors"
        >
          Add More
        </button>

        <div
          {...getRootProps({ className: 'dropzone p-6 border-2 border-dashed border-gray-600 rounded-lg mb-4 cursor-pointer hover:bg-gray-700 transition-colors' })}
        >
          <input {...getInputProps()} />
          <p className="text-center text-lg font-medium text-white">Drag & drop a file here, or click to select one</p>
          {state.filePreview && state.file.type.startsWith('image/') && (
            <img src={state.filePreview} alt="Preview" className="mt-4 max-w-full h-auto rounded-lg" />
          )}
          {state.filePreview && state.file.type.startsWith('application/pdf') && (
            <iframe src={state.filePreview} title="PDF Preview" className="mt-4 w-full h-64 rounded-lg" />
          )}
        </div>

        <div className="flex justify-between mb-4">
          <button
            type="button"
            onClick={saveDraft}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={state.loading}
            className={`bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors ${
              state.loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {state.loading ? <CircularProgress size={24} /> : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SafetyManagementPlan;