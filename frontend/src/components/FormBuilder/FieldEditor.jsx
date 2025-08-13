import React, { useState, useEffect } from 'react';

const FieldEditor = ({ field, onChange, onRemove }) => {
    const [localField, setLocalField] = useState(field);

    useEffect(() => {
        setLocalField(field);
    }, [field]);

    const updateField = (key, value) => {
        const updated = { ...localField, [key]: value };
        setLocalField(updated);
        onChange(updated);
    };

    // --- Options Management ---
    const updateOption = (index, key, value) => {
        const updatedOptions = [...(localField.options || [])];
        updatedOptions[index] = { ...updatedOptions[index], [key]: value };
        updateField('options', updatedOptions);
    };

    const addOption = () => {
        updateField('options', [...(localField.options || []), { text: '', isCorrect: false, order: 0 }]);
    };

    const removeOption = (index) => {
        updateField('options', (localField.options || []).filter((_, i) => i !== index));
    };

    // --- Cloze Options Management ---
    const updateClozeOption = (index, key, value) => {
        const updated = [...(localField.clozeOptions || [])];
        updated[index] = { ...updated[index], [key]: value };
        updateField('clozeOptions', updated);
    };

    const addClozeOption = () => {
        updateField('clozeOptions', [...(localField.clozeOptions || []), { text: '', isCorrect: false, order: 0 }]);
    };

    const removeClozeOption = (index) => {
        updateField('clozeOptions', (localField.clozeOptions || []).filter((_, i) => i !== index));
    };

    return (
        <div className="border p-4 rounded mb-4 bg-gray-50">
            {/* Question Type */}
            <label className="block mb-2">
                Question Type:
                <select
                    value={localField.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="border rounded w-full p-2 mt-1"
                >
                    <option value="categorize">Categorize</option>
                    <option value="cloze">Cloze</option>
                    <option value="comprehension">Comprehension</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="mca">Multiple Correct Answers</option>
                    <option value="shorttext">Short Text</option>
                </select>
            </label>

            {/* Question Text */}
            <label className="block mb-2">
                Question Text:
                <input
                    type="text"
                    value={localField.questionText || ''}
                    onChange={(e) => updateField('questionText', e.target.value)}
                    className="border rounded w-full p-2 mt-1"
                />
            </label>

            {/* Question Image */}
            <label className="block mb-2">
                Question Image URL:
                <input
                    type="text"
                    value={localField.questionImageUrl || ''}
                    onChange={(e) => updateField('questionImageUrl', e.target.value)}
                    className="border rounded w-full p-2 mt-1"
                />
            </label>

            {/* --- Conditional Rendering by Type --- */}
            {localField.type === 'mcq' || localField.type === 'mca' ? (
                <div className="mb-2">
                    <span className="font-semibold">Options:</span>
                    {(localField.options || []).map((option, index) => (
                        <div key={index} className="flex gap-2 mt-1">
                            <input
                                type="text"
                                placeholder="Option text"
                                value={option.text}
                                onChange={(e) => updateOption(index, 'text', e.target.value)}
                                className="border rounded w-full p-2"
                            />
                            <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                            />
                            <input
                                type="number"
                                placeholder="Order"
                                value={option.order}
                                onChange={(e) => updateOption(index, 'order', Number(e.target.value))}
                                className="border rounded p-1 w-20"
                            />
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="bg-red-500 text-white px-2 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                    >
                        + Add Option
                    </button>
                </div>
            ) : null}

                         {localField.type === 'cloze' && (
                 <>
                     <label className="block mb-2">
                         Cloze Sentence:
                         <div className="border rounded w-full p-2 mt-1 bg-white">
                             <div className="mb-2 flex gap-2">
                                 <button
                                     type="button"
                                     onClick={() => {
                                         const textarea = document.getElementById(`cloze-textarea-${localField.order || 0}`);
                                         const start = textarea.selectionStart;
                                         const end = textarea.selectionEnd;
                                         const text = localField.clozeSentence || '';
                                         const before = text.substring(0, start);
                                         const selected = text.substring(start, end);
                                         const after = text.substring(end);
                                         
                                         if (selected) {
                                             const newText = before + `<u>${selected}</u>` + after;
                                             updateField('clozeSentence', newText);
                                         }
                                     }}
                                     className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                 >
                                     Underline (Ctrl+U)
                                 </button>
                                 <button
                                     type="button"
                                     onClick={() => {
                                         const textarea = document.getElementById(`cloze-textarea-${localField.order || 0}`);
                                         const start = textarea.selectionStart;
                                         const end = textarea.selectionEnd;
                                         const text = localField.clozeSentence || '';
                                         const before = text.substring(0, start);
                                         const selected = text.substring(start, end);
                                         const after = text.substring(end);
                                         
                                         if (selected) {
                                             const newText = before + `<blank>${selected}</blank>` + after;
                                             updateField('clozeSentence', newText);
                                         }
                                     }}
                                     className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                 >
                                     Make Blank
                                 </button>
                             </div>
                             <textarea
                                 id={`cloze-textarea-${localField.order || 0}`}
                                 value={localField.clozeSentence || ''}
                                 onChange={(e) => updateField('clozeSentence', e.target.value)}
                                 className="w-full border-0 focus:outline-none resize-none"
                                 rows={4}
                                 placeholder="Type your sentence here. Select text and use buttons above to underline or make blanks."
                                 onKeyDown={(e) => {
                                     if (e.ctrlKey && e.key === 'u') {
                                         e.preventDefault();
                                         const start = e.target.selectionStart;
                                         const end = e.target.selectionEnd;
                                         const text = localField.clozeSentence || '';
                                         const before = text.substring(0, start);
                                         const selected = text.substring(start, end);
                                         const after = text.substring(end);
                                         
                                         if (selected) {
                                             const newText = before + `<u>${selected}</u>` + after;
                                             updateField('clozeSentence', newText);
                                         }
                                     }
                                 }}
                             />
                             <div className="mt-2 text-sm text-gray-600">
                                 <p><strong>Instructions:</strong></p>
                                 <ul className="list-disc list-inside">
                                     <li>Select text and click "Underline" or press Ctrl+U to mark it as underlined</li>
                                     <li>Select text and click "Make Blank" to convert it to a blank space</li>
                                     <li>Underlined text will appear as blanks in the test</li>
                                 </ul>
                             </div>
                         </div>
                     </label>

                    <span className="font-semibold">Cloze Options:</span>
                    {(localField.clozeOptions || []).map((opt, index) => (
                        <div key={index} className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => updateClozeOption(index, 'text', e.target.value)}
                                className="border rounded w-full p-2"
                            />
                            <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={(e) => updateClozeOption(index, 'isCorrect', e.target.checked)}
                            />
                            <button
                                type="button"
                                onClick={() => removeClozeOption(index)}
                                className="bg-red-500 text-white px-2 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addClozeOption}
                        className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                    >
                        + Add Cloze Option
                    </button>

                    {/*<label className="block mb-2 mt-2">
                        Cloze Feedback:
                        <textarea
                            value={localField.clozeFeedback || ''}
                            onChange={(e) => updateField('clozeFeedback', e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>

                    <label className="block mb-2">
                        Cloze Points:
                        <input
                            type="number"
                            value={localField.clozePoints || 0}
                            onChange={(e) => updateField('clozePoints', Number(e.target.value))}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>}*/}
                </>
            )}

            {localField.type === 'comprehension' && (
                <>
                    <label className="block mb-2">
                        Passage:
                        <textarea
                            value={localField.comprehensionPassage || ''}
                            onChange={(e) => updateField('comprehensionPassage', e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>
                    <label className="block mb-2">
                        Passage Image URL:
                        <input
                            type="text"
                            value={localField.comprehensionImageUrl || ''}
                            onChange={(e) => updateField('comprehensionImageUrl', e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>
                </>
            )}

            {localField.type === 'categorize' && (
                <>
                    {/* Categories */}
                    <div className="mb-4">
                        <span className="font-semibold">Categories:</span>
                        <p className="text-sm text-gray-600 mb-2">Type the category titles below</p>
                        {(localField.categories || []).map((cat, index) => (
                            <div key={index} className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    placeholder="Category name"
                                    value={cat.name}
                                    onChange={(e) => {
                                        const updated = [...(localField.categories || [])];
                                        updated[index] = { ...updated[index], name: e.target.value, id: `cat_${index}` };
                                        updateField('categories', updated);
                                    }}
                                    className="border rounded w-full p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = (localField.categories || []).filter((_, i) => i !== index);
                                        updateField('categories', updated);
                                        // Also remove corresponding categorization answers
                                        const updatedAnswers = (localField.categorizationAnswers || []).filter(
                                            answer => answer.categoryId !== `cat_${index}`
                                        );
                                        updateField('categorizationAnswers', updatedAnswers);
                                    }}
                                    className="bg-red-500 text-white px-2 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => {
                                const newIndex = (localField.categories || []).length;
                                updateField('categories', [...(localField.categories || []), { name: '', id: `cat_${newIndex}` }]);
                            }}
                            className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                        >
                            + Add Category
                        </button>
                    </div>

                                         {/* Items to Categorize */}
                     <div className="mb-4">
                         <span className="font-semibold">Items to Categorize:</span>
                         <p className="text-sm text-gray-600 mb-2">Add the options list under "Items". You can re-arrange the Items by using the drag icon.</p>
                         {(localField.itemsToCategorize || []).map((item, index) => (
                             <div 
                                 key={index} 
                                 className="flex gap-2 mt-1 items-center p-2 border rounded bg-white"
                                 draggable
                                 onDragStart={(e) => {
                                     e.dataTransfer.setData('text/plain', index.toString());
                                 }}
                                 onDragOver={(e) => e.preventDefault()}
                                 onDrop={(e) => {
                                     e.preventDefault();
                                     const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                     const newItems = [...(localField.itemsToCategorize || [])];
                                     const draggedItem = newItems[draggedIndex];
                                     newItems.splice(draggedIndex, 1);
                                     newItems.splice(index, 0, draggedItem);
                                     updateField('itemsToCategorize', newItems);
                                 }}
                             >
                                 <button
                                     type="button"
                                     className="text-gray-400 hover:text-gray-600 cursor-move px-1"
                                     title="Drag to reorder"
                                 >
                                     ⋮⋮
                                 </button>
                                 <input
                                     type="text"
                                     placeholder="Item text"
                                     value={item.text}
                                     onChange={(e) => {
                                         const updated = [...(localField.itemsToCategorize || [])];
                                         updated[index] = { ...updated[index], text: e.target.value, id: `item_${index}` };
                                         updateField('itemsToCategorize', updated);
                                     }}
                                     className="border rounded w-full p-2"
                                 />
                                 <button
                                     type="button"
                                     onClick={() => {
                                         const updated = (localField.itemsToCategorize || []).filter((_, i) => i !== index);
                                         updateField('itemsToCategorize', updated);
                                         // Also remove corresponding categorization answers
                                         const updatedAnswers = (localField.categorizationAnswers || []).filter(
                                             answer => answer.itemId !== `item_${index}`
                                         );
                                         updateField('categorizationAnswers', updatedAnswers);
                                     }}
                                     className="bg-red-500 text-white px-2 rounded"
                                 >
                                     ✕
                                 </button>
                             </div>
                         ))}
                         <button
                             type="button"
                             onClick={() => {
                                 const newIndex = (localField.itemsToCategorize || []).length;
                                 updateField('itemsToCategorize', [...(localField.itemsToCategorize || []), { text: '', id: `item_${newIndex}` }]);
                             }}
                             className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                         >
                             + Add Item
                         </button>
                     </div>

                    {/* Categorization Answers */}
                    {(localField.categories || []).length > 0 && (localField.itemsToCategorize || []).length > 0 && (
                        <div className="mb-4">
                            <span className="font-semibold">Categorization Answers:</span>
                            <p className="text-sm text-gray-600 mb-2">Select the categories the items belong to</p>
                            {(localField.itemsToCategorize || []).map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded">
                                    <span className="font-medium min-w-0 flex-1">{item.text || `Item ${itemIndex + 1}`}</span>
                                    <span className="text-gray-500">→</span>
                                    <select
                                        value={(localField.categorizationAnswers || []).find(ans => ans.itemId === `item_${itemIndex}`)?.categoryId || ''}
                                        onChange={(e) => {
                                            const updatedAnswers = [...(localField.categorizationAnswers || [])];
                                            const existingIndex = updatedAnswers.findIndex(ans => ans.itemId === `item_${itemIndex}`);
                                            
                                            if (existingIndex >= 0) {
                                                updatedAnswers[existingIndex] = { itemId: `item_${itemIndex}`, categoryId: e.target.value };
                                            } else {
                                                updatedAnswers.push({ itemId: `item_${itemIndex}`, categoryId: e.target.value });
                                            }
                                            
                                            updateField('categorizationAnswers', updatedAnswers);
                                        }}
                                        className="border rounded p-1"
                                    >
                                        <option value="">Select category...</option>
                                        {(localField.categories || []).map((cat, catIndex) => (
                                            <option key={catIndex} value={`cat_${catIndex}`}>
                                                {cat.name || `Category ${catIndex + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            
                         {/* Common Fields */}
             <label className="block mb-2">
                 Points:
                 <input
                     type="number"
                     value={localField.points || 0}
                     onChange={(e) => updateField('points', Number(e.target.value))}
                     className="border rounded w-full p-2 mt-1"
                 />
             </label>

                         <label className="block mb-2">
                 Order:
                 <input
                     type="number"
                     value={localField.order || 0}
                     onChange={(e) => updateField('order', Number(e.target.value))}
                     className="border rounded w-full p-2 mt-1"
                 />
             </label>

            <button
                type="button"
                onClick={onRemove}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
            >
                Remove Question
            </button>
        </div>
    );
};

export default FieldEditor;
