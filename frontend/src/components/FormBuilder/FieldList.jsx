import React from 'react'
import { Link } from 'react-router-dom'

const FieldList = ({ forms }) => {
    return(
        <ul className="mt-4 flex space-y-2">
            {forms.map(form => (
                <li key={form._id} className="bg-white rounded p-4 w-full max-w-md">
                    <h2 className="text-lg text-left font-semibold mb-3">{form.title}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link 
                            to={`/forms/view/${form._id}`} 
                            className="px-3 py-1 bg-[#1f1f1f] text-white text-sm rounded hover:bg-blue-600 transition-colors"
                        >
                            View
                        </Link>
                        <Link 
                            to={`/forms/edit/${form._id}`} 
                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                        >
                            Edit
                        </Link>
                        <Link 
                            to={`/forms/take/${form._id}`} 
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                            Take Test
                        </Link>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default FieldList;